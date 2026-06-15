import { NextRequest, NextResponse } from 'next/server';
import { getDb, getClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession, verifyCsrf } from '@/lib/auth';
import { enforceRbac, enforceDomainRoleRules } from '@/lib/permissions';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  let sessionConn: any = null;
  let body: any = {};
  try {
    const bodyText = await req.text();
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }
    body = JSON.parse(bodyText);
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid JSON body: ' + (e?.message || String(e)) }, { status: 400 });
  }

  try {
    const { action, collection: collectionName, filter = {}, data = {}, options = {} } = body;

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    // Require session for gateway usage
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const originHost = req.headers.get('host') || req.headers.get('origin') || '';
    enforceDomainRoleRules(session, originHost);

    const db = await getDb();
    const collection = db.collection(collectionName);

    // CSRF protection for mutating actions
    const mutationActions = new Set(['insertOne', 'updateOne', 'deleteOne', 'deleteMany', 'upsert']);
    if (mutationActions.has(action)) {
      const ok = await verifyCsrf(req as unknown as Request);
      if (!ok) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    try {
      enforceRbac(session, action, collectionName);
    } catch (resp: any) {
      return resp;
    }

    const safeFilter = filter || {};
    const safeData = data || {};

    if (safeFilter._id && typeof safeFilter._id === 'string' && ObjectId.isValid(safeFilter._id)) {
      safeFilter._id = new ObjectId(safeFilter._id);
    }
    if (safeFilter._id && typeof safeFilter._id === 'object' && safeFilter._id.$in && Array.isArray(safeFilter._id.$in)) {
      safeFilter._id.$in = safeFilter._id.$in.map((id: any) => {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          return new ObjectId(id);
        }
        return id;
      });
    }
    if (safeData._id && typeof safeData._id === 'string' && ObjectId.isValid(safeData._id)) {
      safeData._id = new ObjectId(safeData._id);
    }

    let result: any = null;

    // Use transaction for critical operations: enrollment, bulk imports, deletion, permission updates
    const isCriticalWrite = mutationActions.has(action) && 
      (collectionName === 'users' || collectionName === 'courses' || collectionName === 'permissions' || collectionName === 'course_folders');

    if (isCriticalWrite) {
      const client = await getClient();
      sessionConn = client.startSession();
      sessionConn.startTransaction();
    }

    const queryOptions = isCriticalWrite ? { ...options, session: sessionConn } : options;

    switch (action) {
      case 'find':
        const cursor = collection.find(safeFilter);
        if (options.sort) cursor.sort(options.sort);
        if (options.limit) cursor.limit(options.limit);
        if (options.skip) cursor.skip(options.skip);
        result = await cursor.toArray();
        break;

      case 'findOne':
        result = await collection.findOne(safeFilter);
        break;

      case 'insertOne':
        if (collectionName === 'course_folders') {
          if (!safeData.parent_folder_id) {
            const isInstructor = session.role === 'instructor';
            safeData.approved = !isInstructor;
          }
        }
        const insertRes = await collection.insertOne(safeData, queryOptions);
        result = { ...safeData, _id: insertRes.insertedId };
        break;

      case 'updateOne':
        const updateRes = await collection.updateOne(safeFilter, { $set: safeData }, queryOptions);
        result = { matchedCount: updateRes.matchedCount, modifiedCount: updateRes.modifiedCount };
        break;

      case 'upsert':
        const upsertRes = await collection.updateOne(
          safeFilter,
          { $set: safeData },
          { ...queryOptions, upsert: true }
        );
        result = { matchedCount: upsertRes.matchedCount, modifiedCount: upsertRes.modifiedCount, upsertedId: upsertRes.upsertedId };
        break;

      case 'deleteOne':
        const deleteRes = await collection.deleteOne(safeFilter, queryOptions);
        result = { deletedCount: deleteRes.deletedCount };
        break;
      
      case 'deleteMany':
        const deleteManyRes = await collection.deleteMany(safeFilter, queryOptions);
        result = { deletedCount: deleteManyRes.deletedCount };
        break;

      default:
        if (sessionConn) await sessionConn.abortTransaction();
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }

    if (sessionConn) {
      await sessionConn.commitTransaction();
    }

    // Log the success mutation event in the background audit trail
    if (mutationActions.has(action)) {
      writeAuditLog(
        req,
        { id: session.id, name: session.full_name || session.email, role: session.role },
        `DB_${action.toUpperCase()}`,
        { entity: collectionName, id: safeFilter._id?.toString() || safeData._id?.toString() || 'unknown' },
        { before: action === 'updateOne' ? safeFilter : null, after: safeData },
        'INFO'
      ).catch(err => console.error('Audit logging err:', err));
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    if (sessionConn) {
      await sessionConn.abortTransaction();
    }
    console.error('[MONGODB GATEWAY ERROR]', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  } finally {
    if (sessionConn) {
      await sessionConn.endSession();
    }
  }
}


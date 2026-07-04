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

    // Require session for gateway usage
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Domain-specific role rules (e.g., supportdomain:4000)
    const originHost = req.headers.get('host') || req.headers.get('origin') || '';
    enforceDomainRoleRules(session, originHost);

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection(collectionName);

    // Require CSRF token for mutations/writes
    const mutationActions = new Set(['insertOne', 'updateOne', 'deleteOne', 'deleteMany', 'upsert']);
    if (mutationActions.has(action)) {
      const ok = await verifyCsrf(req as unknown as Request);
      if (!ok) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Enforce RBAC rules per session/role
    try {
      enforceRbac(session, action, collectionName);
    } catch (resp: any) {
      return resp;
    }

    // Convert string _id to ObjectId if present in filter or data
    if (filter._id && typeof filter._id === 'string' && ObjectId.isValid(filter._id)) {
      filter._id = new ObjectId(filter._id);
    }
    if (filter._id && typeof filter._id === 'object' && filter._id.$in && Array.isArray(filter._id.$in)) {
      filter._id.$in = filter._id.$in.map((id: any) => {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          return new ObjectId(id);
        }
        return id;
      });
    }
    if (data._id && typeof data._id === 'string' && ObjectId.isValid(data._id)) {
      data._id = new ObjectId(data._id);
    }

    let result: any = null;

    // Use transaction for critical operations
    const isCriticalWrite = mutationActions.has(action) && 
      (collectionName === 'users' || collectionName === 'courses' || collectionName === 'permissions' || collectionName === 'course_folders');

    if (isCriticalWrite) {
      const client = await getClient();
      sessionConn = client.startSession();
      sessionConn.startTransaction();
    }

    const queryOptions = isCriticalWrite ? { ...options, session: sessionConn } : options;

    // Prevent deletion or role modification for the primary Super Admin (admin@xmartycreator.com)
    if (collectionName === 'users' && mutationActions.has(action)) {
      const targetUsers = await db.collection('users').find(filter).toArray();
      const containsSuperAdmin = targetUsers.some((u: any) => u.email === 'admin@xmartycreator.com');
      if (containsSuperAdmin) {
        if (action === 'deleteOne' || action === 'deleteMany') {
          return NextResponse.json({ error: 'Super Admin character cannot be deleted. Access Denied!' }, { status: 403 });
        }
        if (action === 'updateOne' || action === 'upsert') {
          if (data.role && data.role !== 'super-admin' && data.role !== 'super_admin') {
            return NextResponse.json({ error: 'Super Admin role modification is not allowed! Access Denied.' }, { status: 403 });
          }
        }
      }
    }

    switch (action) {
      case 'find':
        const cursor = collection.find(filter);
        if (options.sort) cursor.sort(options.sort);
        if (options.limit) cursor.limit(options.limit);
        if (options.skip) cursor.skip(options.skip);
        result = await cursor.toArray();
        break;

      case 'findOne':
        result = await collection.findOne(filter);
        break;

      case 'insertOne':
        const insertRes = await collection.insertOne(data, queryOptions);
        result = { ...data, _id: insertRes.insertedId };
        break;

      case 'updateOne':
        const updateRes = await collection.updateOne(filter, { $set: data }, queryOptions);
        result = { matchedCount: updateRes.matchedCount, modifiedCount: updateRes.modifiedCount };
        break;

      case 'upsert':
        // Custom helper for upsert
        const upsertRes = await collection.updateOne(
          filter,
          { $set: data },
          { ...queryOptions, upsert: true }
        );
        result = { matchedCount: upsertRes.matchedCount, modifiedCount: upsertRes.modifiedCount, upsertedId: upsertRes.upsertedId };
        break;

      case 'deleteOne':
        const deleteRes = await collection.deleteOne(filter, queryOptions);
        result = { deletedCount: deleteRes.deletedCount };
        break;

      case 'deleteMany':
        const deleteManyRes = await collection.deleteMany(filter, queryOptions);
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
        { entity: collectionName, id: filter._id?.toString() || data._id?.toString() || 'unknown' },
        { before: action === 'updateOne' ? filter : null, after: data },
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


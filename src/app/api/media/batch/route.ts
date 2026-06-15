import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ids, payload } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No media IDs provided.' }, { status: 400 });
    }
    const db = await getDb();
    const collection = db.collection('media_assets');
    const objectIds = ids.map((id: string) => new ObjectId(id));

    switch (action) {
      case 'delete':
        await collection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { deleted: true, deleted_at: new Date(), updated_at: new Date() } }
        );
        break;
      case 'restore':
        await collection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { deleted: false, deleted_at: null, updated_at: new Date() } }
        );
        break;
      case 'favorite':
        await collection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { favorite: true, updated_at: new Date() } }
        );
        break;
      case 'move':
        await collection.updateMany(
          { _id: { $in: objectIds } },
          {
            $set: {
              folder_id: payload?.folder_id || null,
              folder_name: payload?.folder_name || null,
              updated_at: new Date(),
            },
          }
        );
        break;
      case 'tags':
        await collection.updateMany(
          { _id: { $in: objectIds } },
          { $set: { tags: payload?.tags || [], updated_at: new Date() } }
        );
        break;
      default:
        return NextResponse.json({ error: 'Unknown bulk action.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

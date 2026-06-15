import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentFolderId = searchParams.get('parentFolderId');
    const db = await getDb();
    const collection = db.collection('media_folders');
    const query: any = {};
    if (parentFolderId) {
      query.parent_folder_id = parentFolderId;
    } else {
      query.$or = [{ parent_folder_id: null }, { parent_folder_id: { $exists: false } }];
    }
    const folders = await collection.find(query).sort({ created_at: -1 }).toArray();
    return NextResponse.json(
      folders.map(folder => ({
        ...folder,
        id: folder._id.toString(),
        _id: undefined,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const name = data.name?.trim();
    const parentFolderId = data.parent_folder_id || null;
    if (!name) {
      return NextResponse.json({ error: 'Folder name is required.' }, { status: 400 });
    }
    const db = await getDb();
    const collection = db.collection('media_folders');
    const folder = {
      name,
      parent_folder_id: parentFolderId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const result = await collection.insertOne(folder);
    return NextResponse.json({ ...folder, id: result.insertedId.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

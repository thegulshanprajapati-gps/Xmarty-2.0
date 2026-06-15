import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: Request, { params }: { params: Promise<{ folderId: string }> }) {
  try {
    const { folderId } = await params;
    const data = await request.json();
    if (!folderId) {
      return NextResponse.json({ error: 'Missing folder id.' }, { status: 400 });
    }

    const updateFields: any = { updated_at: new Date() };
    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.parent_folder_id !== undefined) updateFields.parent_folder_id = data.parent_folder_id || null;

    const db = await getDb();
    const collection = db.collection('media_folders');
    await collection.updateOne({ _id: new ObjectId(folderId) }, { $set: updateFields });
    const folder = await collection.findOne({ _id: new ObjectId(folderId) });
    return NextResponse.json({ ...folder, id: folder?._id.toString(), _id: undefined });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ folderId: string }> }) {
  try {
    const { folderId } = await params;
    if (!folderId) {
      return NextResponse.json({ error: 'Missing folder id.' }, { status: 400 });
    }

    const db = await getDb();
    const folders = db.collection('media_folders');
    const assets = db.collection('media_assets');
    await assets.updateMany({ folder_id: folderId }, { $set: { folder_id: null, folder_name: null, updated_at: new Date() } });
    await folders.deleteOne({ _id: new ObjectId(folderId) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

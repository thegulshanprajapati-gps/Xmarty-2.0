import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing media id.' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('media_assets');
    const updatePayload: any = { updated_at: new Date() };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.tags !== undefined) updatePayload.tags = Array.isArray(data.tags) ? data.tags : [];
    if (data.favorite !== undefined) updatePayload.favorite = !!data.favorite;
    if (data.folder_id !== undefined) updatePayload.folder_id = data.folder_id;
    if (data.folder_name !== undefined) updatePayload.folder_name = data.folder_name;
    if (data.deleted !== undefined) {
      updatePayload.deleted = !!data.deleted;
      if (data.deleted) {
        updatePayload.deleted_at = new Date();
      } else {
        updatePayload.deleted_at = null;
      }
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatePayload });
    const item = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      ...item,
      id: item?._id.toString(),
      _id: undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hardDelete = new URL(request.url).searchParams.get('hard') === 'true';
    if (!id) {
      return NextResponse.json({ error: 'Missing media id.' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('media_assets');
    if (hardDelete) {
      await collection.deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({ success: true, deleted: true });
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { deleted: true, deleted_at: new Date(), updated_at: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

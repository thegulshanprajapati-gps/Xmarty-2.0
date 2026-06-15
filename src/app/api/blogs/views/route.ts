import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { blogId } = await request.json();
    if (!blogId) {
      return NextResponse.json({ error: "Missing blogId" }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('blogs');

    let query: any = { id: blogId };
    if (ObjectId.isValid(blogId)) {
      query = { $or: [{ _id: new ObjectId(blogId) }, { id: blogId }] };
    }

    await collection.updateOne(query, { $inc: { views: 1 } });
    
    const updated = await collection.findOne(query);

    return NextResponse.json({ success: true, views: updated?.views || 1 });
  } catch (error: any) {
    console.error('Failed to increment views:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

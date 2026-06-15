import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (slug) {
      const update = await db.collection('updates').findOne({ slug, status: 'published' });
      if (!update) {
        return NextResponse.json({ error: 'Update not found' }, { status: 404 });
      }
      return NextResponse.json({
        data: {
          ...update,
          id: update._id.toString(),
          _id: undefined
        }
      });
    }

    const updates = await db.collection('updates')
      .find({ status: 'published' })
      .sort({ created_at: -1 })
      .toArray();

    const formatted = updates.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page_slug = searchParams.get('page_slug');

    const db = await getDb();
    const collection = db.collection('content_blocks');

    let query: any = {};
    if (page_slug) {
      query.page_slug = page_slug;
    }

    const blocks = await collection.find(query).toArray();

    // Map _id to id if necessary, or just return as is
    const formattedBlocks = blocks.map(block => ({
      ...block,
      id: block._id.toString(),
    }));

    return NextResponse.json(formattedBlocks);
  } catch (error: any) {
    console.error('Failed to fetch content blocks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { page_slug, section_key, content_key, type, value, json_value } = data;

    if (!page_slug || !section_key || !content_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('content_blocks');

    const query = { page_slug, section_key, content_key };
    const update = {
      $set: {
        page_slug,
        section_key,
        content_key,
        type: type || 'text',
        value: value !== undefined ? value : null,
        json_value: json_value !== undefined ? json_value : null,
        updated_at: new Date()
      },
      $setOnInsert: {
        created_at: new Date()
      }
    };

    await collection.updateOne(query, update, { upsert: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save content block:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

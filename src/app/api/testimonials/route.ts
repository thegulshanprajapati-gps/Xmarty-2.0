import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, role, rating, review } = data;

    if (!name || !role || !rating || !review) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('content_blocks');

    // Find the current testimonials content block
    const block = await collection.findOne({
      page_slug: 'home',
      section_key: 'testimonials',
      content_key: 'list',
    });

    let currentList: any[] = [];
    if (block && Array.isArray(block.json_value)) {
      currentList = block.json_value;
    }

    // Default avatar
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=crop&w=150&h=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=150&h=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=150&h=150',
    ];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newTestimonial = {
      name,
      role,
      rating: String(rating),
      review,
      avatar: randomAvatar,
    };

    currentList.push(newTestimonial);

    // Upsert the updated list back into content_blocks
    await collection.updateOne(
      { page_slug: 'home', section_key: 'testimonials', content_key: 'list' },
      {
        $set: {
          page_slug: 'home',
          section_key: 'testimonials',
          content_key: 'list',
          type: 'list',
          value: null,
          json_value: currentList,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, item: newTestimonial });
  } catch (error: any) {
    console.error('Failed to submit student testimonial:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

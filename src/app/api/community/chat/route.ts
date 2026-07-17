import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Community slug is required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Seed default messages if room is empty to guide the user
    const count = await db.collection('community_messages').countDocuments({ community_slug: slug });
    if (count === 0) {
      const systemMessages = [
        {
          community_slug: slug,
          sender_name: "Vasant AI Assistant",
          sender_email: "vasant@xmarty.com",
          message: `Welcome to the ${slug.replace(/-/g, ' ')} community channel! Feel free to introduce yourself and start collaborating.`,
          created_at: new Date(Date.now() - 3600000)
        }
      ];
      await db.collection('community_messages').insertMany(systemMessages);
    }

    const community = await db.collection('communities').findOne({ slug });

    const messages = await db.collection('community_messages')
      .find({ community_slug: slug })
      .sort({ created_at: 1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      community: community ? {
        name: community.name,
        description: community.description,
        slug: community.slug
      } : null,
      messages: messages.map((m: any) => ({
        ...m,
        id: m._id.toString(),
        _id: undefined
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { slug, message } = await req.json();

    if (!slug || !message) {
      return NextResponse.json({ error: 'Slug and message are required' }, { status: 400 });
    }

    // Verify community is approved
    const community = await db.collection('communities').findOne({ slug, status: 'approved' });
    if (!community) {
      return NextResponse.json({ error: 'Community does not exist or is pending approval.' }, { status: 400 });
    }

    const newMessage = {
      community_slug: slug,
      sender_name: session.full_name || session.email.split('@')[0],
      sender_email: session.email,
      message: message.trim(),
      created_at: new Date()
    };

    const result = await db.collection('community_messages').insertOne(newMessage);

    return NextResponse.json({
      success: true,
      message: {
        ...newMessage,
        id: result.insertedId.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

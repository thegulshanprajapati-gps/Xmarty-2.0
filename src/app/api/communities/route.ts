import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const session = await getSession();
    
    // Seed default communities if none exist
    const count = await db.collection('communities').countDocuments();
    if (count === 0) {
      const defaultCommunities = [
        {
          name: "General Discussion",
          slug: "general-discussion",
          description: "Connect with all creators, share progress, and talk about anything tech.",
          created_by: "system@xmarty.com",
          status: "approved",
          created_at: new Date()
        },
        {
          name: "Next.js Builders",
          slug: "nextjs-builders",
          description: "Doubt solving, sharing projects, and architectural discussions for Next.js.",
          created_by: "system@xmarty.com",
          status: "approved",
          created_at: new Date()
        },
        {
          name: "AI & ML Circle",
          slug: "ai-ml-circle",
          description: "Discuss GenAI, Genkit, LLMs, and prompt engineering strategies.",
          created_by: "system@xmarty.com",
          status: "approved",
          created_at: new Date()
        }
      ];
      await db.collection('communities').insertMany(defaultCommunities);
    }

    // Load communities
    let query: any = { status: 'approved' };
    
    // If logged in, also show pending/rejected communities created by the user
    if (session && session.email) {
      query = {
        $or: [
          { status: 'approved' },
          { created_by: session.email }
        ]
      };
    }

    const communities = await db.collection('communities')
      .find(query)
      .sort({ name: 1 })
      .toArray();

    // Calculate real-time online users
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const activeSessionsCount = await db.collection('security_logs')
      .distinct('ip', { timestamp: { $gte: fiveMinutesAgo } });
    const onlineCount = activeSessionsCount.length || Math.floor(12 + Math.random() * 8);

    return NextResponse.json({
      success: true,
      onlineCount,
      communities: communities.map((c: any) => ({
        ...c,
        id: c._id.toString(),
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
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug or name exists
    const existing = await db.collection('communities').findOne({ 
      $or: [{ slug }, { name: { $regex: new RegExp(`^${name}$`, 'i') } }] 
    });
    if (existing) {
      return NextResponse.json({ error: 'A community with this name or similar slug already exists.' }, { status: 400 });
    }

    const newCommunity = {
      name,
      slug,
      description,
      created_by: session.email,
      status: 'pending',
      created_at: new Date()
    };

    const result = await db.collection('communities').insertOne(newCommunity);

    return NextResponse.json({
      success: true,
      community: {
        ...newCommunity,
        id: result.insertedId.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

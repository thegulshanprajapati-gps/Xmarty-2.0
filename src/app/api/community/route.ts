import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

async function ensureSeedData(db: any) {
  const count = await db.collection('community_posts').countDocuments();
  if (count === 0) {
    const seed = [
      {
        title: "Next.js 15 Turbopack Build Error",
        content: "Anyone getting webpack errors when deploying to Vercel with Turbopack enabled? Need help resolving this.",
        author: "Aman Sharma",
        authorEmail: "aman@xmarty.com",
        tags: ["nextjs", "turbopack"],
        likes: 12,
        replies: 3,
        created_at: new Date(Date.now() - 4 * 3600000)
      },
      {
        title: "MongoDB connection limits on Atlas",
        content: "What is the best way to reuse MongoClient connections in Next.js Server Actions? My connection pool is filling up quickly.",
        author: "Rohit Verma",
        authorEmail: "rohit@xmarty.com",
        tags: ["mongodb", "database"],
        likes: 8,
        replies: 5,
        created_at: new Date(Date.now() - 10 * 3600000)
      },
      {
        title: "Tailwind v4 upgrade feedback",
        content: "Just migrated my project to CSS-only Tailwind v4 config. The build speeds are blazing fast, but some plugin configurations broke.",
        author: "Sneha Patel",
        authorEmail: "sneha@xmarty.com",
        tags: ["css", "tailwind"],
        likes: 19,
        replies: 11,
        created_at: new Date(Date.now() - 24 * 3600000)
      }
    ];
    await db.collection('community_posts').insertMany(seed);
  }
}

export async function GET() {
  try {
    const db = await getDb();
    await ensureSeedData(db);
    
    const posts = await db.collection('community_posts')
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      posts: posts.map((p: any) => ({
        ...p,
        id: p._id.toString(),
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
    const { title, content, tags } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const authorName = session.full_name || session.email.split('@')[0];
    const newPost = {
      title,
      content,
      author: authorName,
      authorEmail: session.email,
      tags: tags || [],
      likes: 0,
      replies: 0,
      created_at: new Date()
    };

    const result = await db.collection('community_posts').insertOne(newPost);
    return NextResponse.json({
      success: true,
      post: {
        ...newPost,
        id: result.insertedId.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { id, action } = await req.json();

    if (!id || action !== 'like') {
      return NextResponse.json({ error: "Invalid action or missing Post ID" }, { status: 400 });
    }

    await db.collection('community_posts').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { likes: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const query = { _id: new ObjectId(id) };
    const post = await db.collection('community_posts').findOne(query);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Verify ownership or check if admin
    const isAdmin = session.role === 'admin' || session.role === 'super_admin';
    const isOwner = post.authorEmail === session.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden: You are not authorized to delete this post" }, { status: 403 });
    }

    await db.collection('community_posts').deleteOne(query);
    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

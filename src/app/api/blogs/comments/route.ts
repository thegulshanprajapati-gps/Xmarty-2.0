import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');

    const db = await getDb();
    const query: any = { approved: { $ne: false } };
    if (blogId) {
      query.blogId = blogId;
    }

    const comments = await db.collection('blog_comments')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    const formatted = comments.map((c: any) => ({
      ...c,
      id: c._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { blogId, blogTitle, blogSlug, name, comment, rating } = payload;

    if (!name || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    const resolvedBlogId = blogId || "general";
    const newComment = {
      blogId: resolvedBlogId,
      blogTitle: blogTitle || (resolvedBlogId === "general" ? "General Platform Review" : "Unnamed Article"),
      blogSlug: blogSlug || "",
      name,
      comment,
      rating: rating || 5,
      date: new Date(),
      approved: true
    };

    const res = await db.collection('blog_comments').insertOne(newComment);

    return NextResponse.json({
      success: true,
      comment: {
        ...newComment,
        id: res.insertedId.toString()
      }
    });
  } catch (error: any) {
    console.error('Failed to submit comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

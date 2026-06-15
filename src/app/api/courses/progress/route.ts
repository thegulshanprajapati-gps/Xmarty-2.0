import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response('Unauthorized session', { status: 401 });
    }

    const { courseId, folderId, completed } = await request.json();
    if (!courseId || !folderId) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const db = await getDb();
    const email = session.email.toLowerCase();

    if (completed) {
      await db.collection('course_progress').updateOne(
        { email, courseId },
        { $addToSet: { completedFolderIds: folderId } },
        { upsert: true }
      );
    } else {
      await db.collection('course_progress').updateOne(
        { email, courseId },
        { $pull: { completedFolderIds: folderId } }
      );
    }

    // Retrieve updated progress to calculate status
    const progressDoc = await db.collection('course_progress').findOne({ email, courseId });
    const completedFolderIds = progressDoc?.completedFolderIds || [];

    return NextResponse.json({ success: true, completedFolderIds });
  } catch (error: any) {
    return new Response(error.message || 'Error updating progress', { status: 500 });
  }
}

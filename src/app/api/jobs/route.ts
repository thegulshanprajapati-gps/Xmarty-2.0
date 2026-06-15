import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const jobs = await db.collection('background_jobs')
      .find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      jobs: jobs.map((j: any) => ({
        ...j,
        id: j._id.toString(),
        _id: undefined
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const db = await getDb();
    
    // Quick search across students, instructors, courses, assessments
    const users = await db.collection('users').find({
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { full_name: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).toArray();

    const courses = await db.collection('courses').find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).toArray();

    const assessments = await db.collection('assessments').find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).limit(5).toArray();

    const results = [
      ...users.map(u => ({ id: u._id.toString(), title: u.full_name || u.email, category: 'User', subtitle: u.role })),
      ...courses.map(c => ({ id: c._id.toString(), title: c.title, category: 'Course', subtitle: c.category })),
      ...assessments.map(a => ({ id: a._id.toString(), title: a.title, category: 'Assessment', subtitle: a.type || 'Test' }))
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

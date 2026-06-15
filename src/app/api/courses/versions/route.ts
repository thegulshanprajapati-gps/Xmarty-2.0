import { NextRequest, NextResponse } from 'next/server';
import { getCourseVersions, restoreCourseVersion } from '@/lib/version-control';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const versions = await getCourseVersions(courseId);
    return NextResponse.json({ success: true, versions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, version } = await req.json();

    if (!courseId || !version) {
      return NextResponse.json({ error: 'courseId and version are required' }, { status: 400 });
    }

    const ok = await restoreCourseVersion(courseId, version);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to restore version' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

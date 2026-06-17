import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createSecureAccessToken, generateFingerprint } from '@/lib/secure-token';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const reqHeaders = await headers();
    const userAgent = reqHeaders.get('user-agent') || '';
    const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';
    const fingerprint = generateFingerprint(userAgent, ip);

    // Generate secure token for the course catalog page access
    const token = createSecureAccessToken({
      courseId,
      folderId: 'catalog',
      email: session.email,
      enrollmentStatus: 'enrolled',
      fingerprint
    }, 5 * 60 * 1000); // 5 minutes validity

    return NextResponse.json({ success: true, url: `/courses/enrolled/${token}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

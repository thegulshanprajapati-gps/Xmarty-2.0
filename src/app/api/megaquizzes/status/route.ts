import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { headers } from 'next/headers';
import { generateFingerprint, createSecureAccessToken } from '@/lib/secure-token';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required to check status.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDb();
    const registration = await db.collection('mega_quiz_registrations').findOne({ email: normalizedEmail });

    if (!registration) {
      return NextResponse.json({ status: 'not_found', message: 'No registration found for this email address.' });
    }

    if (registration.status === 'pending') {
      return NextResponse.json({ status: 'pending', message: 'Your registration is currently pending admin approval.' });
    }

    if (registration.status === 'rejected') {
      return NextResponse.json({ status: 'rejected', message: 'Your registration has been rejected by the administrator.' });
    }

    if (registration.status === 'approved') {
      // Generate a secure access token for the mega quiz
      const reqHeaders = await headers();
      const userAgent = reqHeaders.get('user-agent') || '';
      const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';
      
      const fingerprint = generateFingerprint(userAgent, ip);

      // Create secure token bound to user context
      const token = createSecureAccessToken({
        courseId: 'megaquiz',
        folderId: 'test',
        email: normalizedEmail,
        enrollmentStatus: 'approved',
        fingerprint
      }, 30 * 60 * 1000); // 30 minute expiry

      return NextResponse.json({ 
        status: 'approved', 
        token, 
        message: 'Your registration is approved! Click below to start your dynamic exam session.' 
      });
    }

    return NextResponse.json({ error: 'Invalid registration status.' }, { status: 500 });
  } catch (err: any) {
    console.error('Mega Quiz status API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createCsrfToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const token = await createCsrfToken();
  const cookieStore = await cookies();
  cookieStore.set('csrf_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  return NextResponse.json({ csrfToken: token });
}

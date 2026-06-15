import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { signAccessToken, signRefreshToken, setSession, createCsrfToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json();
    
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const result = await db.collection('users').insertOne({
      email,
      password_hash,
      full_name,
      role: assignedRole,
      enrolled_courses: [],
      created_at: new Date()
    });

    const payload = {
      id: result.insertedId.toString(),
      email,
      full_name,
      role: assignedRole
    };

    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    const csrf = await createCsrfToken();
    await setSession(access, refresh, csrf);

    return NextResponse.json({ user: payload });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

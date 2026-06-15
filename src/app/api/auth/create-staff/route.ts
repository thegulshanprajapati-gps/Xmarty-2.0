import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSession, verifyCsrf } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    // Authorization: Only the configured ADMIN_EMAIL (Super Admin) is allowed
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!session || !adminEmail || session.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized. Only the Super Admin can register staff members.' }, { status: 403 });
    }

    const ok = await verifyCsrf(request);
    if (!ok) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });

    const { email, password, full_name, role } = await request.json();
    
    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 });
    }

    const validRoles = ['super-admin', 'admin', 'editor'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be super-admin, admin, or editor.' }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user exists
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.collection('users').insertOne({
      email,
      password_hash,
      full_name,
      role: role,
      enrolled_courses: [],
      two_factor_enabled: false,
      totp_secret: null,
      backup_codes: [],
      created_at: new Date()
    });

    return NextResponse.json({ success: true, message: `Successfully created staff account with role: ${role}` });
  } catch (error: any) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

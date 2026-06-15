import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { signAccessToken, signRefreshToken, setSession, createCsrfToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Admin hardcoded dev fallback or regular verification
    let userDetails: any = null;
    let role = 'student';

    const adminEmail = process?.env?.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@xmartycreator.com';
    const devAdminPassword = process.env.ADMIN_PASSWORD || 'XmartyAdmin2024!';

    if (email === adminEmail) {
      if (password !== devAdminPassword) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }
      role = 'super_admin';
      userDetails = { id: 'dev-admin', email, full_name: 'Super Admin', role: 'super_admin' };
    } else {
      const db = await getDb();
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });

      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 401 });
      }

      const storedPassword = user.password || '';
      const storedHash = user.password_hash || '';

      let isMatch = false;
      if (storedPassword && storedPassword === password) {
        isMatch = true;
      } else if (storedHash) {
        isMatch = await bcrypt.compare(password, storedHash);
      }

      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }

      role = user.role || 'student';
      userDetails = user;
    }

    if (role !== 'super_admin' && role !== 'admin' && role !== 'editor' && role !== 'instructor') {
      return NextResponse.json({ error: 'This portal is restricted to Instructors, Admins, and Editors.' }, { status: 403 });
    }

    const payload = {
      id: userDetails._id?.toString() || userDetails.id,
      email: userDetails.email,
      full_name: userDetails.full_name || userDetails.name || '',
      role: role
    };

    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    const csrf = await createCsrfToken();
    await setSession(access, refresh, csrf);

    return NextResponse.json({
      success: true,
      user: payload,
      csrfToken: csrf
    });
  } catch (error: any) {
    console.error('Login error in instructor domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

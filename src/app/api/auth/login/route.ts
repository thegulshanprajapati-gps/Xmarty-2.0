import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { signAccessToken, signRefreshToken, setSession, createCsrfToken } from '@/lib/auth';
import { enforceDomainRoleRules } from '@/lib/permissions';
import { writeAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

// Simple in-memory throttling map: { key: { attempts: number, lastAttempt: number, lockedUntil?: number } }
const failedAttempts: Record<string, { attempts: number; lastAttempt: number; lockedUntil?: number }> = {};

function throttleKey(email: string, origin: string) {
  return `${origin}::${email}`;
}

function isLocked(key: string) {
  const record = failedAttempts[key];
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) return true;
  return false;
}

function registerFailedAttempt(key: string) {
  const now = Date.now();
  const rec = failedAttempts[key] || { attempts: 0, lastAttempt: 0 };
  rec.attempts = (rec.attempts || 0) + 1;
  rec.lastAttempt = now;
  if (rec.attempts >= 5) {
    // lock for 15 minutes
    rec.lockedUntil = now + 15 * 60 * 1000;
    rec.attempts = 0; // reset attempts after lock
  }
  failedAttempts[key] = rec;
}

function clearAttempts(key: string) {
  delete failedAttempts[key];
}

export async function POST(request: Request) {
  let email = 'unknown';
  let origin = '';
  try {
    const body = await request.json();
    email = body.email || 'unknown';
    const password = body.password;

    origin = request.headers.get('origin') || request.headers.get('host') || '';
    const host = request.headers.get('host') || '';

    // CSRF protection for login: validate origin when present
    if (request.headers.get('origin')) {
      const allowed = process.env.ALLOWED_ORIGIN || host;
      if (!String(origin).includes(allowed) && !String(origin).includes(host)) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
      }
    }
    const tkey = throttleKey(email, origin);
    if (isLocked(tkey)) return NextResponse.json({ error: 'Too many failed attempts. Try later.' }, { status: 429 });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ email });

    if (!user || !user.password_hash) {
      const useDevFallback = process.env.NODE_ENV !== 'production';
      const devAdminEmail = process.env.ADMIN_EMAIL;
      const devAdminPassword = process.env.ADMIN_PASSWORD;
      if (useDevFallback && devAdminEmail && devAdminPassword && email === devAdminEmail && password === devAdminPassword) {
        const payload = { id: 'dev-admin', email, full_name: 'Super Admin', role: 'super-admin' };
        const access = await signAccessToken(payload);
        const refresh = await signRefreshToken(payload);
        const csrf = await createCsrfToken();
        await setSession(access, refresh, csrf);
        return NextResponse.json({ user: payload });
      }
      registerFailedAttempt(tkey);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      registerFailedAttempt(tkey);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name || '',
      role: user.role || 'user'
    };

    // Domain restrictions: don't allow instructor/student logins on supportdomain
    const originHost = request.headers.get('host') || request.headers.get('origin') || '';
    enforceDomainRoleRules(payload, originHost);

    // Successful login: clear any failed attempts
    clearAttempts(tkey);

    const access = await signAccessToken(payload);
    const refresh = await signRefreshToken(payload);
    const csrf = await createCsrfToken();
    await setSession(access, refresh, csrf);

    // Write audit log
    writeAuditLog(
      request,
      { id: payload.id, name: payload.full_name || payload.email, role: payload.role },
      'USER_LOGIN',
      { entity: 'users', id: payload.id },
      { before: null, after: { email: payload.email, role: payload.role } },
      'INFO'
    ).catch(err => console.error('Audit logging err:', err));

    return NextResponse.json({ user: payload });
  } catch (error: any) {
    console.error('Login error:', error);
    if (email && origin) {
      registerFailedAttempt(throttleKey(email, origin));
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

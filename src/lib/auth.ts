import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { SessionUser } from '@/types/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (IS_PRODUCTION && !JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in production environment');
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET || 'fallback_secret_for_development_only_12345');

// Access token: short-lived (default 30m). Refresh token: 7d.
export async function signAccessToken(payload: Record<string, any>, expires = '15m') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(SECRET_KEY);
}

export async function signRefreshToken(payload: Record<string, any>, expires = '7d') {
  // embed a rotation id
  const jti = crypto.randomBytes(16).toString('hex');
  return await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as any;
  } catch (error) {
    return null;
  }
}

export async function verifyAccessToken(token: string) {
  return await verifyToken(token);
}

export async function verifyRefreshToken(token: string) {
  return await verifyToken(token);
}

export async function createCsrfToken() {
  return crypto.randomBytes(24).toString('hex');
}

export async function setSession(accessToken: string, refreshToken: string, csrfToken?: string) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth', // limit refresh token scope to auth endpoints
  });

  if (csrfToken) {
    // CSRF cookie is intentionally NOT httpOnly so double-submit is possible
    cookieStore.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  // Authoritative role and permissions must come from DB, not from token payload
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: payload.id ? new ObjectId(payload.id) : payload.id });
    if (!user) {
      // If DB user not found, fallback to token payload but mark as unauthenticated
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name || payload.full_name || '',
      role: user.role || 'user'
    } as SessionUser;
  } catch (e) {
    return payload as SessionUser | null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('csrf_token');
}

export async function getCsrfFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get('csrf_token')?.value || null;
}

export async function verifyCsrf(request: Request) {
  // Double-submit: header must match csrf cookie
  const headerToken = request.headers.get('x-csrf-token');
  const cookieToken = await getCsrfFromCookies();
  if (!headerToken || !cookieToken) return false;
  return headerToken === cookieToken;
}


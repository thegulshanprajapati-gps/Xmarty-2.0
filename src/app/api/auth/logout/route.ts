import { NextRequest, NextResponse } from 'next/server';
import { clearSession, getSession } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSession();
  
  if (session) {
    writeAuditLog(
      req,
      { id: session.id, name: session.full_name || session.email, role: session.role },
      'USER_LOGOUT',
      { entity: 'users', id: session.id },
      { before: null, after: null },
      'INFO'
    ).catch(err => console.error('Audit logging err:', err));
  }

  await clearSession();
  const res = NextResponse.json({ success: true });
  // Belt-and-suspenders: explicitly set cookies to expired in the response too
  res.cookies.set('access_token', '', { maxAge: 0, path: '/' });
  res.cookies.set('refresh_token', '', { maxAge: 0, path: '/api/auth' });
  res.cookies.set('csrf_token', '', { maxAge: 0, path: '/' });
  return res;
}

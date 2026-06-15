import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const method = req.method;
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isMutation) {
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://xmartycreator.com',
      'https://instructor.xmartycreator.com',
    ];
    if (origin) {
      const isAllowed = allowedOrigins.some((o) => origin === o || origin.startsWith(o + '/'));
      if (!isAllowed) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF violation: invalid origin' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
    }

    const csrfCookie = req.cookies.get('csrf_token')?.value;
    const csrfHeader = req.headers.get('x-csrf-token');

    // Bypass CSRF checks for internal calls carrying correct internal secret
    const internalSecret = req.headers.get('X-Internal-Secret');
    const isInternalCall = internalSecret === (process.env.RBAC_INTERNAL_SECRET || 'xmarty-internal-secret-change-in-prod');

    if (!isInternalCall) {
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF violation: token mismatch or missing' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply CSRF checking pattern specifically on API mutation endpoints and key dynamic pages
    '/api/:path*',
  ],
};

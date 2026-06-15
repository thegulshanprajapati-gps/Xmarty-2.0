import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/auth';
import { generateFingerprint, verifySecureAccessToken } from '@/lib/secure-token';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const fileId = searchParams.get('fileId');

    if (!token || !fileId) {
      return new Response('Missing required parameters', { status: 400 });
    }

    // 1. Authenticate user session
    const session = await getSession();
    if (!session) {
      return new Response('Unauthorized session', { status: 401 });
    }

    // 2. Resolve headers and verify signature fingerprint
    const headersList = request.headers;
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    // 2.2 Enforce rate limiting
    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const limiterResult = await checkRateLimit({
      key: session.email || ip,
      action: 'file_download',
      limit: 60, // Limit downloads to 60/min
      windowMs: 60 * 1000
    });
    if (!limiterResult.allowed) {
      const { logSecurityEvent } = await import('@/lib/audit');
      await logSecurityEvent({
        category: 'RATE_LIMIT_EXCEEDED',
        ip,
        userAgent,
        email: session.email,
        status: 'WARN',
        details: { action: 'api_courses_file_endpoint' }
      });
      return new Response('Rate limit exceeded. Please slow down.', { status: 429 });
    }

    const fingerprint = generateFingerprint(userAgent, ip);
    const payload = await verifySecureAccessToken(token, fingerprint, { ip, userAgent, email: session.email });
    if (!payload || payload.email.toLowerCase() !== session.email.toLowerCase()) {
      const { logSecurityEvent } = await import('@/lib/audit');
      await logSecurityEvent({
        category: 'UNAUTHORIZED_FILE_ACCESS',
        ip,
        userAgent,
        email: session.email,
        status: 'ALERT',
        details: { fileId, token }
      });
      return new Response('Invalid or expired file access token', { status: 403 });
    }

    const db = await getDb();

    // 3. Find file document in DB
    const isMongoId = ObjectId.isValid(fileId);
    let fileDoc = null;
    if (isMongoId) {
      fileDoc = await db.collection('course_contents').findOne({ _id: new ObjectId(fileId) });
    }
    if (!fileDoc) {
      fileDoc = await db.collection('course_contents').findOne({ id: fileId });
    }

    if (!fileDoc) {
      return new Response('File not found', { status: 404 });
    }

    // 4. Verify file belongs to the authorized folder in token
    if (fileDoc.folder_id !== payload.folderId) {
      return new Response('Unauthorized folder access mapping', { status: 403 });
    }

    const fileUrl: string = fileDoc.file_url;
    if (!fileUrl) {
      return new Response('Missing asset stream reference', { status: 404 });
    }

    // 5. Hardened Path Traversal Protection
    if (fileUrl.includes('../') || fileUrl.includes('..\\') || decodeURIComponent(fileUrl).includes('../')) {
      return new Response('Illegal path traversal vector detected', { status: 400 });
    }

    // 6. Fetch asset content from storage securely
    const fetchResponse = await fetch(fileUrl);
    if (!fetchResponse.ok) {
      return new Response('Failed to retrieve storage payload', { status: 502 });
    }

    const fileBuffer = await fetchResponse.arrayBuffer();
    const contentType = fetchResponse.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = `inline; filename="${encodeURIComponent(fileDoc.file_name || 'download')}"`;

    // 7. Secure Headers output serving
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: any) {
    return new Response(error.message || 'Stream processing error', { status: 500 });
  }
}

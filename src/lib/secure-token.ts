import crypto from 'crypto';
import { getDb } from './mongodb';
import { logSecurityEvent } from './audit';

const SECRET = process.env.JWT_SECRET || 'xmarty_super_lms_secure_token_secret_998877';

export interface SecureAccessTokenPayload {
  courseId: string;
  folderId: string;
  email: string;
  enrollmentStatus: string;
  expiresAt: number;
  fingerprint: string;
  nonce: string; // Anti-replay nonce
}

export function generateFingerprint(userAgent: string, ip: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(`${userAgent}-${ip}`)
    .digest('hex');
}

export function createSecureAccessToken(
  payload: Omit<SecureAccessTokenPayload, 'expiresAt' | 'nonce'>,
  expiresInMs: number = 20 * 60 * 1000
): string {
  const expiresAt = Date.now() + expiresInMs;
  const nonce = crypto.randomBytes(16).toString('hex');
  const fullPayload: SecureAccessTokenPayload = {
    ...payload,
    expiresAt,
    nonce,
  };
  const payloadStr = JSON.stringify(fullPayload);
  const signature = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
  return Buffer.from(JSON.stringify({ payload: fullPayload, signature })).toString('base64url');
}

export async function verifySecureAccessToken(
  token: string,
  currentFingerprint: string,
  clientContext: { ip: string; userAgent: string; email?: string }
): Promise<SecureAccessTokenPayload | null> {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const { payload, signature } = JSON.parse(raw) as { payload: SecureAccessTokenPayload; signature: string };

    const payloadStr = JSON.stringify(payload);
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) {
      await logSecurityEvent({
        category: 'TOKEN_TAMPERING',
        ip: clientContext.ip,
        userAgent: clientContext.userAgent,
        email: clientContext.email || payload.email,
        status: 'ALERT',
        details: { token, msg: 'Signature mismatch' }
      });
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      await logSecurityEvent({
        category: 'TOKEN_VALIDATION_FAILED',
        ip: clientContext.ip,
        userAgent: clientContext.userAgent,
        email: clientContext.email || payload.email,
        status: 'WARN',
        details: { token, msg: 'Token expired' }
      });
      return null;
    }

    if (payload.fingerprint !== currentFingerprint) {
      await logSecurityEvent({
        category: 'SUSPICIOUS_SESSION',
        ip: clientContext.ip,
        userAgent: clientContext.userAgent,
        email: clientContext.email || payload.email,
        status: 'ALERT',
        details: { token, expectedFingerprint: payload.fingerprint, actualFingerprint: currentFingerprint }
      });
      return null;
    }

    // Prevents replay attacks: Record nonce in DB.
    // If the nonce already exists, the token is reused.
    const db = await getDb();
    const nonceCollection = db.collection('used_nonces');
    try {
      await nonceCollection.insertOne({
        nonce: payload.nonce,
        usedAt: new Date(),
        expiresAt: new Date(payload.expiresAt)
      });
    } catch (dbErr: any) {
      // Duplicate key error code in MongoDB is 11000
      if (dbErr.code === 11000 || String(dbErr).includes('duplicate key')) {
        await logSecurityEvent({
          category: 'TOKEN_REPLAY',
          ip: clientContext.ip,
          userAgent: clientContext.userAgent,
          email: clientContext.email || payload.email,
          status: 'ALERT',
          details: { token, nonce: payload.nonce, msg: 'Token replay attempt detected' }
        });
        return null;
      }
      throw dbErr;
    }

    return payload;
  } catch (e: any) {
    await logSecurityEvent({
      category: 'TOKEN_VALIDATION_FAILED',
      ip: clientContext.ip,
      userAgent: clientContext.userAgent,
      email: clientContext.email,
      status: 'WARN',
      details: { token, err: e.message || String(e) }
    });
    return null;
  }
}

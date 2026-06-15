import { getDb } from './mongodb';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Sliding window rate limiter using MongoDB for per-IP and per-User tracking.
 * Provides burst defense and accurate distributed rate limiting.
 */
export async function checkRateLimit(options: {
  key: string;      // e.g. "ip:1.2.3.4" or "user:test@test.com"
  action: string;   // e.g. "file_access", "upload", "page_view"
  limit: number;    // max requests allowed in window
  windowMs: number; // window size in milliseconds
}): Promise<RateLimitResult> {
  const { key, action, limit, windowMs } = options;
  const db = await getDb();
  const collection = db.collection('rate_limits');

  const now = Date.now();
  const bucketKey = `${action}:${key}`;

  // Clean old attempts
  await collection.deleteMany({
    key: bucketKey,
    timestamp: { $lt: now - windowMs }
  });

  // Count current window attempts
  const count = await collection.countDocuments({ key: bucketKey });

  if (count >= limit) {
    // Find oldest timestamp in window to estimate reset time
    const oldestDoc = await collection.findOne({ key: bucketKey }, { sort: { timestamp: 1 } });
    const resetTime = oldestDoc ? oldestDoc.timestamp + windowMs : now + windowMs;

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetTime
    };
  }

  // Record this attempt
  await collection.insertOne({
    key: bucketKey,
    timestamp: now,
    expiresAt: new Date(now + windowMs)
  });

  return {
    allowed: true,
    limit,
    remaining: limit - count - 1,
    resetTime: now + windowMs
  };
}

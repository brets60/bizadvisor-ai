/**
 * In-memory sliding window rate limiter
 * Protects AI route handlers and authentication endpoints from abuse.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    cache.forEach((record, key) => {
      if (record.resetAt < now) {
        cache.delete(key);
      }
    });
  }, 5 * 60 * 1000).unref?.();
}

export function checkRateLimit(
  identifier: string,
  limit: number = 30, // max requests
  windowMs: number = 60 * 1000 // 1 minute window
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = cache.get(identifier);

  if (!record || record.resetAt < now) {
    cache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}

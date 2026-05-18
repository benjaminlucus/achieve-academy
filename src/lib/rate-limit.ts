/**
 * In-memory rate limiter (per server instance).
 * For multi-instance production, replace with Redis / Upstash.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimitOrThrow(
  req: Request,
  namespace: string,
  limit: number,
  windowMs: number
): void {
  const ip = getClientIp(req);
  const result = rateLimit(`${namespace}:${ip}`, limit, windowMs);
  if (!result.success) {
    const err = new Error("Too many requests");
    (err as Error & { status: number }).status = 429;
    throw err;
  }
}

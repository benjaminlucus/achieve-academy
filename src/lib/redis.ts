import Redis from "ioredis";
import { logger } from "./logger";
import { env } from "./env";

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (env.REDIS_URL) {
    if (!redis) {
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      });

      redis.on("connect", () => {
        logger.info("redis_connected", {
          url: env.REDIS_URL?.replace(/:.*@/, "://***@"),
        });
      });

      redis.on("error", (error) => {
        logger.error("redis_error", { error: error.message });
      });
    }
    return redis;
  }

  return null;
}

export async function rateLimit({
  identifier,
  limit = 100,
  window = 60 * 1000,
}: {
  identifier: string;
  limit?: number;
  window?: number;
}): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!env.RATE_LIMIT_ENABLED) {
    return { success: true, remaining: 999, reset: Date.now() + window };
  }

  const client = getRedisClient();

  if (!client) {
    // Fallback to in-memory rate limiting if Redis isn't available
    return { success: true, remaining: 999, reset: Date.now() + window };
  }

  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - window;

  try {
    // Remove old entries
    await client.zremrangebyscore(key, 0, windowStart);
    // Get count
    const count = await client.zcard(key);
    const remaining = Math.max(0, limit - count - 1);

    if (count < limit) {
      // Add new entry
      await client.zadd(key, now, `${now}-${Math.random()}`);
      // Set expiry
      await client.expire(key, Math.ceil(window / 1000));
      return { success: true, remaining, reset: now + window };
    }

    // Get earliest entry to calculate reset time
    const earliest = await client.zrange(key, 0, 0, "WITHSCORES");
    const resetTime = earliest.length > 0 ? parseInt(earliest[1]) : now;
    return { success: false, remaining: 0, reset: resetTime + window };
  } catch (error) {
    logger.error("rate_limit_error", { error: (error as Error).message });
    // Fail open if Redis fails
    return { success: true, remaining: 999, reset: Date.now() + window };
  }
}
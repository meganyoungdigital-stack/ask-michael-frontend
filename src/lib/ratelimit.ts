import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ============================
   SAFE REDIS INIT
============================ */

let redis: Redis | null = null;
let ratelimitInstance: Ratelimit | null = null;

const hasRedisEnv =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

if (hasRedisEnv) {
  try {
    redis = Redis.fromEnv();

    ratelimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
      analytics: true,
      prefix: "ask-michael",
    });
  } catch (err) {
    console.warn("⚠️ Redis init failed, disabling rate limit:", err);
    redis = null;
    ratelimitInstance = null;
  }
} else {
  console.warn("⚠️ Redis env not found, rate limit disabled");
}

/* ============================
   SAFE RATE LIMIT EXPORT
============================ */

export const ratelimit = {
  async limit(identifier: string) {
    if (!ratelimitInstance) {
      // ✅ Safe fallback (no rate limiting)
      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 60 * 1000,
      };
    }

    try {
      return await ratelimitInstance.limit(identifier);
    } catch (err) {
      console.error("Rate limit error:", err);

      // ✅ Fail open (never block user if Redis fails)
      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 60 * 1000,
      };
    }
  },
};

/* ============================
   HELPER FUNCTION
============================ */

export async function checkRateLimit(identifier: string) {
  const result = await ratelimit.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
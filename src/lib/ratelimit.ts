import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ============================
   REDIS CLIENT
============================ */

let redis: Redis | null = null;

try {
  redis = Redis.fromEnv();
} catch {
  console.warn("Redis not configured, rate limit disabled");
}

/* ============================
   RATE LIMIT CONFIG
============================ */

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
      analytics: true,
      prefix: "ask-michael",
    })
  : {
      limit: async () => ({
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
      }),
    };

/* ============================
   RATE LIMIT HELPER
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
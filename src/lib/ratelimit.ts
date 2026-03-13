import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ============================
   REDIS CLIENT
============================ */

const redis = Redis.fromEnv();

/* ============================
   RATE LIMIT CONFIG
============================ */

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
  analytics: true,
  prefix: "ask-michael",
});

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
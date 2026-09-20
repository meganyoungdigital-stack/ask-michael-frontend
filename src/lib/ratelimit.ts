import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ============================
   SAFE REDIS INIT
============================ */

let redis: Redis | null = null;
let ratelimitInstance: Ratelimit | null = null;
let partnerRatelimitInstance: Ratelimit | null = null;
let adminLoginRatelimitInstance: Ratelimit | null = null;
let partnerLoginRatelimitInstance: Ratelimit | null = null;
let partnerForgotPasswordRatelimitInstance: Ratelimit | null = null;

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

partnerRatelimitInstance = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 partner requests per minute
  analytics: true,
  prefix: "ask-michael-partner",
});

adminLoginRatelimitInstance = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 admin login attempts per 15 minutes
  analytics: true,
  prefix: "ask-michael-admin-login",
});

partnerLoginRatelimitInstance = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 partner login attempts per 15 minutes
  analytics: true,
  prefix: "ask-michael-partner-login",
});

partnerForgotPasswordRatelimitInstance = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 partner password reset requests per 15 minutes
  analytics: true,
  prefix: "ask-michael-partner-forgot-password",
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

export const partnerRatelimit = {
  async limit(identifier: string) {
    if (!partnerRatelimitInstance) {
      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 60 * 1000,
      };
    }

    try {
      return await partnerRatelimitInstance.limit(identifier);
    } catch (err) {
      console.error("Partner rate limit error:", err);

      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 60 * 1000,
      };
    }
  },
};

export const adminLoginRatelimit = {
  async limit(identifier: string) {
    if (!adminLoginRatelimitInstance) {
      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 15 * 60 * 1000,
      };
    }

    try {
      return await adminLoginRatelimitInstance.limit(identifier);
    } catch (err) {
      console.error("Admin login rate limit error:", err);

      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 15 * 60 * 1000,
      };
    }
  },
};

export const partnerLoginRatelimit = {
  async limit(identifier: string) {
    if (!partnerLoginRatelimitInstance) {
      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 15 * 60 * 1000,
      };
    }

    try {
      return await partnerLoginRatelimitInstance.limit(identifier);
    } catch (err) {
      console.error("Partner login rate limit error:", err);

      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 15 * 60 * 1000,
      };
    }
  },
};

export const partnerForgotPasswordRatelimit = {
  async limit(identifier: string) {
    if (!partnerForgotPasswordRatelimitInstance) {
      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 15 * 60 * 1000,
      };
    }

    try {
      return await partnerForgotPasswordRatelimitInstance.limit(identifier);
    } catch (err) {
      console.error(
        "Partner forgot password rate limit error:",
        err
      );

      return {
        success: true,
        limit: 0,
        remaining: 9999,
        reset: Date.now() + 15 * 60 * 1000,
      };
    }
  },
};

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


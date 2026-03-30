/* ============================
TIER CONFIGURATION
============================ */

export type Tier = "free" | "pro" | "pro_plus"; // ✅ extended

export const TIERS = {
  free: {
    messagesPerDay: 10,
    features: {
      rag: true,
      ops: false,
      cad: false,
      priority: false,
    },
  },
  pro: {
    messagesPerDay: 200,
    features: {
      rag: true,
      ops: true,
      cad: false,
      priority: true,
    },
  },

  /* ✅ NEW: PRO+ */
  pro_plus: {
    messagesPerDay: 1000,
    features: {
      rag: true,
      ops: true,
      cad: true,
      priority: true,
    },
  },
};

/* ============================
FEATURE ACCESS CHECK
============================ */

export function hasFeature(
  tier: Tier,
  feature: keyof typeof TIERS.free.features
) {
  return TIERS[tier]?.features?.[feature] ?? false;
}

/* ============================
MESSAGE LIMIT CHECK
============================ */

export function getMessageLimit(tier: Tier) {
  return TIERS[tier]?.messagesPerDay ?? 10;
}
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getUserUsage,
  upsertUser,
  connectToDatabase,
} from "@/lib/mongodb";

/* ============================
🔥 LOCAL DATE FIX (MATCH CHAT ROUTE)
============================ */
function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const date = `${year}-${month}-${day}`;

  console.log("USAGE API DATE:", date);

  return date;
}

/* ============================
PLAN LIMITS
============================ */

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 200; // ✅ CHANGED FROM 500 → 200

export async function GET() {
  try {
    /* ============================
    AUTH
    ============================ */

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ============================
    ENSURE USER EXISTS
    ============================ */

    await upsertUser(userId);

    /* ============================
    GET USAGE COUNT
    ============================ */

    let usageCount = await getUserUsage(userId);

    console.log("RAW USAGE (helper):", usageCount);

    /* ============================
    🔥 FIX: ENSURE DAILY USAGE (CRITICAL)
    ============================ */

    const { db } = await connectToDatabase();

    /* ✅ USE SAME LOCAL DATE FUNCTION */
    const today = getTodayString();

    console.log("FETCH USAGE:", userId, today);

    const usageDoc = await db.collection("usage").findOne({
      userId,
      date: today,
    });

    console.log("USAGE DOC:", usageDoc);

    /* ✅ HARD OVERRIDE — ONLY TRUST DATE-BASED VALUE */
    const dailyUsage = usageDoc?.count || 0;

    usageCount = dailyUsage;

    console.log("FINAL USAGE COUNT (USED):", usageCount);

    /* ============================
    GET USER PLAN
    ============================ */

    const user = await db
      .collection("users")
      .findOne({ userId });

    const tier = user?.tier || "free";

const isPro = tier === "pro" || tier === "pro_plus";

const limit =
  tier === "pro" || tier === "pro_plus"
    ? PRO_DAILY_LIMIT
    : FREE_DAILY_LIMIT;

    /* ============================
    RESPONSE (STANDARDIZED)
    ============================ */

    return NextResponse.json({
  used: usageCount,   // ✅ FIXED KEY
  limit,
  isPro,
});

  } catch (error) {
    console.error("[USAGE_API_ERROR]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
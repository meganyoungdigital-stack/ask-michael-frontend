export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getUserUsage,
  upsertUser,
  connectToDatabase,
} from "@/lib/mongodb";

/* ============================
PLAN LIMITS
============================ */

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 500;

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

    const usageCount = await getUserUsage(userId);

    /* ============================
    GET USER PLAN
    ============================ */

    const { db } = await connectToDatabase();

    const user = await db
      .collection("users")
      .findOne({ userId });

    const isPro = user?.tier === "pro";

    const dailyLimit = isPro
      ? PRO_DAILY_LIMIT
      : FREE_DAILY_LIMIT;

    /* ============================
    RESPONSE
    ============================ */

    return NextResponse.json({
      usageCount,
      dailyLimit,
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
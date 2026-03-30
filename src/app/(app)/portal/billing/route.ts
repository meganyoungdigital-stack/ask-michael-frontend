import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { getMessageLimit } from "@/lib/tiers";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({ userId });

    const tier = user?.tier || "free";
    const status = user?.subscriptionStatus || "inactive";

    const today = new Date().toISOString().split("T")[0];

    const usage = await db.collection("usage").findOne({
      userId,
      date: today,
    });

    const used = usage?.count || 0;
    const limit = getMessageLimit(tier);

    return NextResponse.json({
      tier,
      subscriptionStatus: status,
      usage: {
        used,
        limit,
      },
    });

  } catch (error) {
    console.error("Billing error:", error);

    return NextResponse.json(
      { error: "Failed to load billing" },
      { status: 500 }
    );
  }
}
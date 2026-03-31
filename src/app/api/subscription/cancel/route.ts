import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    await db.collection("users").updateOne(
      { userId },
      {
        $set: {
          tier: "free",
          subscriptionStatus: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Cancel subscription error:", error);

    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
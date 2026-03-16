import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversationId } = await context.params;

    const { db } = await connectToDatabase();

    const shareId = randomUUID();

    const result = await db.collection("conversations").updateOne(
      { conversationId, userId },
      {
        $set: {
          isPublic: true,
          shareId,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`,
    });
  } catch (error) {
    console.error("[SHARE_ERROR]", error);
    return NextResponse.json(
      { error: "Share failed" },
      { status: 500 }
    );
  }
}
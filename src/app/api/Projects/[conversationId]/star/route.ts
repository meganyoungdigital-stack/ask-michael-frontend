import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params; // ✅ Next 16 fix

    const db = await connectToDatabase();

    const conversation = await db.collection("conversations").findOne({
      conversationId,
      userId,
    });

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.collection("conversations").updateOne(
      { conversationId, userId },
      { $set: { starred: !conversation.starred } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Star toggle failed" }, { status: 500 });
  }
}
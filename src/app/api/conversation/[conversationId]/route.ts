import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

/* ================= GET ================= */
export async function GET(
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

    // ✅ Correct handling for Next.js 16
    const { conversationId } = await context.params;
    const { db } = await connectToDatabase();

    const conversation = await db
      .collection("conversations")
      .findOne({ conversationId, userId });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      messages: conversation.messages || [],
    });
  } catch (error) {
    console.error("[CONVERSATION_GET_ERROR]", error);

    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}

/* ================= PATCH ================= */
export async function PATCH(
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

    const body = await req.json();

    const { db } = await connectToDatabase();

    const result = await db.collection("conversations").updateOne(
      { conversationId, userId },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONVERSATION_PATCH_ERROR]", error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(
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

    const result = await db.collection("conversations").deleteOne({
      conversationId,
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONVERSATION_DELETE_ERROR]", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
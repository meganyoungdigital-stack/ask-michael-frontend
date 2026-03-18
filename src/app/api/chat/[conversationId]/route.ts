import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

/* ================= POST ================= */
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

    const params = await context.params;
    const conversationId = params.conversationId;

    const body = await req.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const userMessage = {
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    await db.collection("conversations").updateOne(
  { conversationId, userId },
  {
    $push: { messages: userMessage },
    $set: { updatedAt: new Date() },
  } as any
);

    const aiReply = `You said: ${message}`;

    const aiMessage = {
      role: "assistant",
      content: aiReply,
      createdAt: new Date(),
    };

    await db.collection("conversations").updateOne(
  { conversationId, userId },
  {
    $push: { messages: aiMessage },
  } as any
);

    return NextResponse.json({
      reply: aiReply,
    });

  } catch (error) {
    console.error("[CHAT_ERROR]", error);

    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
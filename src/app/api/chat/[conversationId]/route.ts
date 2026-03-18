import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

/* ================= OPENAI ================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ================= POST ================= */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> } // ✅ FIXED (Next.js 16)
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ MUST AWAIT params
    const { conversationId } = await context.params;

    const body = await req.json();
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    /* ================= SAVE USER MESSAGE ================= */
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

    /* ================= AUTO TITLE ================= */
    const conversation = await db
      .collection("conversations")
      .findOne({ conversationId, userId });

    if (
      conversation &&
      (!conversation.title || conversation.title === "New Chat")
    ) {
      const autoTitle = message
        .slice(0, 40)
        .replace(/\n/g, " ");

      await db.collection("conversations").updateOne(
        { conversationId, userId },
        { $set: { title: autoTitle } }
      );
    }

    /* ================= AI RESPONSE ================= */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional AI assistant for structural engineering, ISO standards, and technical compliance.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const aiReply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "I couldn’t generate a response.";

    /* ================= SAVE AI MESSAGE ================= */
    const aiMessage = {
      role: "assistant",
      content: aiReply,
      createdAt: new Date(),
    };

    await db.collection("conversations").updateOne(
      { conversationId, userId },
      {
        $push: { messages: aiMessage },
        $set: { updatedAt: new Date() }, // ✅ keep timestamps consistent
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
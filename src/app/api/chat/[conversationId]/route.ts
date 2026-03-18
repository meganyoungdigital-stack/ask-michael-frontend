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
  context: { params: Promise<{ conversationId: string }> } // ✅ Next.js 16
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

    /* ================= AUTO TITLE (FIXED) ================= */
    await db.collection("conversations").findOneAndUpdate(
      {
        conversationId,
        userId,
        $or: [
          { title: { $exists: false } },
          { title: "" },
          { title: "New Chat" },
          { title: "Untitled Chat" },
        ],
      },
      {
        $set: {
          title: message.slice(0, 40).replace(/\n/g, " ").trim(),
        },
      }
    );

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
        $set: { updatedAt: new Date() },
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
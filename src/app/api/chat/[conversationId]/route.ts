import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

export const runtime = "nodejs";

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
      return new Response("Unauthorized", { status: 401 });
    }

    const { conversationId } = await context.params;

    const body = await req.json();
    const message = body.message?.trim();

    if (!message) {
      return new Response("Message required", { status: 400 });
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

    /* ================= AUTO TITLE (KEEP YOUR LOGIC) ================= */
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

    /* ================= STREAM AI RESPONSE ================= */
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
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

    let fullReply = "";
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token =
              chunk.choices?.[0]?.delta?.content || "";

            if (token) {
              fullReply += token;
              controller.enqueue(encoder.encode(token));
            }
          }

          /* ================= SAVE AI MESSAGE ================= */
          await db.collection("conversations").updateOne(
            { conversationId, userId },
            {
              $push: {
                messages: {
                  role: "assistant",
                  content: fullReply,
                  createdAt: new Date(),
                },
              },
              $set: { updatedAt: new Date() },
            } as any
          );

          controller.close();
        } catch (err) {
          console.error("STREAM ERROR:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

  } catch (error) {
    console.error("[CHAT_ERROR]", error);

    return new Response("Chat failed", { status: 500 });
  }
}
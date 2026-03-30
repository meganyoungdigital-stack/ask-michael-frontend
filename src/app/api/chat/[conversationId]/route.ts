import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

/* ✅ NEW */
import { getMessageLimit, hasFeature } from "@/lib/tiers";

export const runtime = "nodejs";

/* ================= OPENAI ================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ================= POST ================= */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { conversationId } = await context.params;

    const { db } = await connectToDatabase();

    /* ================= GET USER PLAN ================= */
    const user = await db.collection("users").findOne({ userId });
    const isPro = user?.tier === "pro";

    /* ✅ NEW: GET MESSAGE LIMIT */
    const tier = (user?.tier || "free") as "free" | "pro" | "pro_plus";
    const messageLimit = getMessageLimit(tier);

    /* ================= USAGE CHECK ================= */
    const today = new Date().toISOString().split("T")[0];

    const usage = await db.collection("usage").findOne({
      userId,
      date: today,
    });

    const currentUsage = usage?.count || 0;

    /* 🚫 BLOCK IF LIMIT REACHED */
    if (currentUsage >= messageLimit) {
      return new Response(
        JSON.stringify({
          error: "Daily message limit reached",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    /* ================= PARSE REQUEST ================= */
    let message = "";
    let files: File[] = [];

    try {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();

        message = (formData.get("message") as string)?.trim() || "";
        files = (formData.getAll("files") as File[]) || [];
      } else {
        const body = await req.json();
        message = body.message?.trim();
      }
    } catch {
      return new Response("Invalid request format", { status: 400 });
    }

    if (!message) {
      return new Response("Message required", { status: 400 });
    }

    /* ================= FEATURE ACCESS ================= */
    const canUsePriority = hasFeature(tier, "priority");

    /* ================= BLOCK FILES FOR FREE USERS ================= */
    if (!hasFeature(tier, "priority") && files.length > 0) {
      return new Response("File uploads require Pro plan", { status: 403 });
    }

    /* ================= PROCESS FILES ================= */
    let fileContext = "";

    if (files.length > 0) {
      for (const file of files) {
        try {
          const text = await file.text();
          fileContext += `\n\n[FILE: ${file.name}]\n${text.slice(0, 2000)}`;
        } catch (err) {
          console.error("File read error:", err);
        }
      }
    }

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

    /* ================= BUILD PROMPT ================= */
    const systemPrompt =
      "You are a professional AI assistant for structural engineering, ISO standards, and technical compliance.\n\n" +
      "Use any provided file data when relevant.\n\n" +
      "FILE DATA:\n" +
      fileContext;

    /* ================= AI RESPONSE ================= */
    const completion = await openai.chat.completions.create({
      model: tier === "pro_plus" ? "gpt-4o" : "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No response";

    /* ================= SAVE AI MESSAGE ================= */
    await db.collection("conversations").updateOne(
      { conversationId, userId },
      {
        $push: {
          messages: {
            role: "assistant",
            content: reply,
            createdAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      } as any
    );

    /* ✅ NEW: RECORD USAGE */
    await db.collection("usage").updateOne(
      { userId, date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    /* ================= RETURN JSON ================= */
    return new Response(
      JSON.stringify({
        reply,
        success: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("[CHAT_ERROR]", error);

    return new Response(
      JSON.stringify({
        error: "Chat failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
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

    /* ================= GET USER ================= */
    const user = await db.collection("users").findOne({ userId });

    const tier = (user?.tier || "free") as "free" | "pro" | "pro_plus";
    const messageLimit = getMessageLimit(tier);

    /* ================= PERSONALIZATION ================= */
    let userContext = `
User Profile:
- Name: ${user?.name || "Unknown"}
- Company: ${user?.company || "Unknown"}
- Subscription Tier: ${tier}

Instructions:
- Tailor responses to the user's company and industry when relevant
- Provide practical, real-world engineering guidance
`;

    if (tier === "pro") {
      userContext += `
- Provide detailed engineering explanations
- Reference standards (ISO, AWS, ASME) where applicable
`;
    }

    if (tier === "pro_plus") {
      userContext += `
- Provide expert-level analysis
- Include optimization strategies and risk predictions
- Think like a senior engineering consultant
`;
    }

    /* ================= COMPANY MEMORY ================= */
    let companyMemory = "";

    if (user?.company) {
      const memoryDocs = await db
        .collection("company_memory")
        .find({ company: user.company })
        .limit(5)
        .toArray();

      if (memoryDocs.length > 0) {
        companyMemory =
          "\n\nCompany Knowledge:\n" +
          memoryDocs.map((doc) => doc.content).join("\n");
      }
    }

    /* ================= USAGE CHECK ================= */
    const today = new Date().toISOString().split("T")[0];

    const usage = await db.collection("usage").findOne({
      userId,
      date: today,
    });

    const currentUsage = usage?.count || 0;

    /* 🔥 UPGRADE TRIGGER (REPLACED BLOCK) */
    if (currentUsage >= messageLimit) {
      const upgradeMessage = `
⚡ You've reached your daily limit (${messageLimit} messages).

Upgrade to unlock more:

• Pro → More messages + deeper engineering insights  
• Pro+ → Advanced analysis, file understanding, and expert recommendations  

👉 Upgrade here: /pricing
`;

      return new Response(
        JSON.stringify({
          reply: upgradeMessage,
          upgrade: true,
          limit: messageLimit,
          used: currentUsage,
        }),
        {
          status: 200,
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

    if (!canUsePriority && files.length > 0) {
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
      userContext + "\n\n" +
      companyMemory + "\n\n" +   // 🔥 COMPANY MEMORY INJECTION
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

    /* ================= SAVE COMPANY MEMORY ================= */
    if (user?.company && message.length > 50) {
      await db.collection("company_memory").insertOne({
        company: user.company,
        content: message,
        createdAt: new Date(),
      });
    }

    /* ================= USAGE TRACK ================= */
    await db.collection("usage").updateOne(
      { userId, date: today },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          lastReset: new Date(),
        },
      },
      { upsert: true }
    );

    /* ================= RETURN ================= */
    return new Response(
      JSON.stringify({
        reply,
        success: true,
        usage: {
          used: currentUsage + 1,
          limit: messageLimit,
        },
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
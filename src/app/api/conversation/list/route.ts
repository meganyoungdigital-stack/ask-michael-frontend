import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import {
  recordUserUsage,
  getUserUsage,
  appendMessageToConversation,
} from "@/lib/mongodb";
import type { Message } from "@/lib/mongodb";

interface AskRequest {
  messages: Message[];
  conversationId: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    /* ============================
       STEP 1 — AUTH
    ============================ */

    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    /* ============================
       STEP 2 — VALIDATE BODY
    ============================ */

    const body: AskRequest = await req.json();
    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { success: false, error: "Invalid request - messages array required" },
        { status: 400 }
      );
    }

    if (!conversationId || typeof conversationId !== "string") {
      return Response.json(
        { success: false, error: "Invalid request - conversationId required" },
        { status: 400 }
      );
    }

    console.log(
      `[ASK_REQUEST] userId: ${userId}, conversationId: ${conversationId}, messageCount: ${messages.length}`
    );

    /* ============================
       STEP 3 — CHECK DAILY USAGE
    ============================ */

    const usageCount = await getUserUsage(userId);
    const DAILY_LIMIT = 50;

    if (usageCount >= DAILY_LIMIT) {
      return Response.json(
        {
          success: false,
          error: "Daily message limit reached. Please upgrade your plan.",
        },
        { status: 429 }
      );
    }

    /* ============================
       STEP 4 — CALL OPENAI DIRECTLY
    ============================ */

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantReply =
      completion.choices[0]?.message?.content || "No response generated.";

    /* ============================
       STEP 5 — SAVE TO DATABASE
    ============================ */

    try {
      await recordUserUsage(userId);

      const latestUserMessage = messages[messages.length - 1];

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantReply,
        createdAt: new Date(),
      };

      // Save user message
      await appendMessageToConversation(conversationId, {
        ...latestUserMessage,
        createdAt: new Date(),
      });

      // Save assistant reply
      await appendMessageToConversation(
        conversationId,
        assistantMessage
      );

      console.log(
        `[CONVERSATION_SAVED] userId: ${userId}, conversationId: ${conversationId}`
      );
    } catch (dbError) {
      console.error("[DB_ERROR] Failed to record usage/conversation", dbError);
    }

    /* ============================
       STEP 6 — RETURN RESPONSE
    ============================ */

    return Response.json({
      success: true,
      message: assistantReply,
    });

  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`[ASK_ERROR] ${errorMsg}`);

    return Response.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
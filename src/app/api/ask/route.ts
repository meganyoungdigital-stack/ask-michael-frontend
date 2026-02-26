import { auth } from "@clerk/nextjs/server";
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

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Parse body
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
       STEP A — CHECK USAGE
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
       STEP B — CALL BACKEND
    ============================ */

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!backendUrl) {
      return Response.json(
        { success: false, error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(`${backendUrl}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const backendData = await backendResponse.json();

    /* ============================
       STEP C — SAVE DATA
    ============================ */

    if (backendData.success) {
      try {
        await recordUserUsage(userId);

        const latestUserMessage = messages[messages.length - 1];

        const assistantMessage: Message = {
          role: "assistant",
          content:
            backendData.message ||
            backendData.response ||
            backendData.advice ||
            "",
          createdAt: new Date(),
        };

        // Append user message
        await appendMessageToConversation(conversationId, {
          ...latestUserMessage,
          createdAt: new Date(),
        });

        // Append assistant message
        await appendMessageToConversation(
          conversationId,
          assistantMessage
        );

        console.log(
          `[CONVERSATION_SAVED] userId: ${userId}, conversationId: ${conversationId}`
        );
      } catch (dbError) {
        console.error(
          `[DB_ERROR] Failed to record usage/conversation`,
          dbError
        );
      }
    }

    return Response.json(backendData, {
      status: backendResponse.status,
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
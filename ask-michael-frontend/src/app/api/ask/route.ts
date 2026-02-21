import { auth } from "@clerk/nextjs/server";
import { recordUserUsage, getUserUsage, appendMessageToConversation } from "@/lib/mongodb";
import type { Message } from "@/lib/mongodb";

interface AskRequest {
  messages: Message[];
}

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    // Reject if not authenticated
    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized - please sign in" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { messages, conversationId } = body;

    // Validate messages and conversationId
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

    // Log request with userId and conversationId
    console.log(
      `[ASK_REQUEST] userId: ${userId}, conversationId: ${conversationId}, messageCount: ${messages.length}`
    );

    // Step A — Get user usage
    const usage = await getUserUsage(userId);

    // Step B — Block if exceeded
    const DAILY_LIMIT = 50;
    if (usage && usage.messageCount >= DAILY_LIMIT) {
      return Response.json(
        { success: false, error: "Daily message limit reached. Please upgrade your plan." },
        { status: 429 }
      );
    }

    // Step C — Only then call backend API
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

    // Log usage and record in MongoDB
    if (backendData.success) {
      console.log(`[ASK_SUCCESS] userId: ${userId}, conversationId: ${conversationId}, advice received`);
      try {
        // Record user usage
        await recordUserUsage(userId);

        // Save conversation - append both user message and assistant response
        const latestUserMessage = messages[messages.length - 1];
        const assistantMessage: Message = {
          role: "assistant",
          content: backendData.message || backendData.response || backendData.advice || "",
        };
        await appendMessageToConversation(conversationId, userId, [
          latestUserMessage,
          assistantMessage
        ]);
        console.log(`[CONVERSATION_SAVED] userId: ${userId}, conversationId: ${conversationId}, conversation updated`);
      } catch (dbError) {
        console.error(`[DB_ERROR] Failed to record usage/conversation for userId: ${userId}, conversationId: ${conversationId}`, dbError);
      }
    } else {
      console.log(`[ASK_ERROR] userId: ${userId}, conversationId: ${conversationId}, error: ${backendData.error}`);
    }

    return Response.json(backendData, { status: backendResponse.status });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ASK_ERROR] ${errorMsg}`);
    return Response.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import {
  recordUserUsage,
  getUserUsage,
  appendMessageToConversation,
  getConversation,
  connectToDatabase,
} from "@/lib/mongodb";
import type { Message } from "@/lib/mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    /* =====================================================
       🔐 AUTH
    ===================================================== */
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // ✅ FORCE STRING TYPE FOR TYPESCRIPT
    const safeUserId: string = userId;

    const body = await req.json();
    const { messages, conversationId } = body;

    if (!messages || !conversationId) {
      return new Response("Invalid request", { status: 400 });
    }

    /* =====================================================
       🔒 VALIDATE CONVERSATION OWNERSHIP
    ===================================================== */
    const conversation = await getConversation(
      conversationId,
      safeUserId
    );

    if (!conversation) {
      return new Response("Conversation not found", {
        status: 404,
      });
    }

    /* =====================================================
       💳 TIER + USAGE LOGIC
    ===================================================== */
    const usageCount = await getUserUsage(safeUserId);

    const DAILY_FREE_LIMIT = 50;
    const isPro = false; // Stripe later
    const limit = isPro ? 1000 : DAILY_FREE_LIMIT;

    if (usageCount >= limit) {
      return new Response("Daily limit reached", {
        status: 429,
      });
    }

    const latestUserMessage: Message =
      messages[messages.length - 1];

    /* =====================================================
       🧠 AI TITLE GENERATION (FIRST MESSAGE ONLY)
    ===================================================== */
    if (conversation.messages.length === 0) {
      try {
        const titleCompletion =
          await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `
You are an AI system for a structural engineering platform.

Generate:
1) A short professional conversation title (3-6 words)
2) A category label

Allowed categories:
- ISO 3834
- WPS
- Welding
- Structural Design
- Steel Connection
- Cost Estimation
- Quality Control
- Inspection
- General Engineering

Respond ONLY in this JSON format:

{
"title": "Short Title Here",
"category": "One Category From List"
}

No explanations.
                `,
              },
              {
                role: "user",
                content: latestUserMessage.content,
              },
            ],
            max_tokens: 100,
          });

        const raw =
          titleCompletion.choices[0]?.message?.content || "";

        let parsed: any = null;

        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }

        const generatedTitle =
          parsed?.title ||
          latestUserMessage.content.slice(0, 40);

        const generatedCategory =
          parsed?.category || "General Engineering";

        const db = await connectToDatabase();

        await db.collection("conversations").updateOne(
          { conversationId, userId: safeUserId },
          {
            $set: {
              title: `[${generatedCategory}] ${generatedTitle}`,
              projectType: generatedCategory,
              updatedAt: new Date(),
            },
          }
        );
      } catch (err) {
        console.error("Title generation failed:", err);
      }
    }

    /* =====================================================
       💬 STREAM MAIN AI RESPONSE
    ===================================================== */

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          for await (const chunk of completion) {
            const token =
              chunk.choices[0]?.delta?.content || "";

            if (token) {
              fullResponse += token;
              controller.enqueue(
                encoder.encode(token)
              );
            }
          }

          /* =====================================================
             💾 SAVE MESSAGES AFTER STREAM ENDS
          ===================================================== */

          const userMessageToSave: Message = {
            role: "user",
            content: latestUserMessage.content,
            createdAt: new Date(),
          };

          const assistantMessage: Message = {
            role: "assistant",
            content: fullResponse,
            createdAt: new Date(),
          };

          await appendMessageToConversation(
            conversationId,
            safeUserId,
            userMessageToSave
          );

          await appendMessageToConversation(
            conversationId,
            safeUserId,
            assistantMessage
          );

          await recordUserUsage(safeUserId);
        } catch (err) {
          console.error("Streaming error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[ASK_ERROR]", error);
    return new Response("Internal server error", {
      status: 500,
    });
  }
}
export const runtime = "nodejs";

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
  apiKey: process.env.OPENAI_API_KEY,
});

/* =====================================================
   📄 READ ATTACHMENT TEXT
===================================================== */

async function getAttachmentText(attachments: any[]) {
  let text = "";

  for (const file of attachments) {
    if (!file?.url) continue;

    try {
      const res = await fetch(file.url);
      const fileText = await res.text();

      text += `\n\nFILE: ${file.name}\n${fileText}`;
    } catch (err) {
      console.error("Attachment read error:", err);
    }
  }

  return text;
}

export async function POST(req: Request) {
  try {
    /* =====================================================
       🔐 AUTH
    ===================================================== */

    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const safeUserId = userId;

    /* =====================================================
       📦 BODY
    ===================================================== */

    const body = await req.json();
    const { messages, conversationId } = body;

    if (!messages || !conversationId || !Array.isArray(messages)) {
      return new Response("Invalid request body", { status: 400 });
    }

    /* =====================================================
       🔒 VERIFY CONVERSATION
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
       📄 LOAD ATTACHMENTS (RAG)
    ===================================================== */

    const attachments = conversation.attachments || [];

    const documentText = await getAttachmentText(attachments);

    /* =====================================================
       💳 USAGE LIMIT
    ===================================================== */

    const usageCount = await getUserUsage(safeUserId);

    const DAILY_FREE_LIMIT = 50;
    const isPro = false;
    const limit = isPro ? 1000 : DAILY_FREE_LIMIT;

    if (usageCount >= limit) {
      return new Response("Daily limit reached", {
        status: 429,
      });
    }

    const latestUserMessage: Message =
      messages[messages.length - 1];

    /* =====================================================
       🧠 TITLE GENERATION
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
Generate:
1) Short professional title (3-6 words)
2) Category from this list:
ISO 3834, WPS, Welding, Structural Design,
Steel Connection, Cost Estimation,
Quality Control, Inspection, General Engineering

Respond ONLY as JSON:
{
"title": "Title",
"category": "Category"
}
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
       🧠 BUILD FINAL MESSAGES WITH DOCUMENT CONTEXT
    ===================================================== */

    const finalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
You are an engineering AI assistant.

If documents are provided, use them to answer the user's question.

DOCUMENT CONTENT:
${documentText}
        `,
      },
      ...messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    /* =====================================================
       💬 MAIN AI RESPONSE (STREAM)
    ===================================================== */

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        stream: true,
        messages: finalMessages,
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
            console.error("Streaming loop error:", err);
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
    } catch (streamError) {
      console.error("Stream init failed:", streamError);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: finalMessages,
      });

      const fullResponse =
        completion.choices[0]?.message?.content ||
        "AI failed to respond.";

      await appendMessageToConversation(
        conversationId,
        safeUserId,
        {
          role: "user",
          content: latestUserMessage.content,
          createdAt: new Date(),
        }
      );

      await appendMessageToConversation(
        conversationId,
        safeUserId,
        {
          role: "assistant",
          content: fullResponse,
          createdAt: new Date(),
        }
      );

      await recordUserUsage(safeUserId);

      return new Response(fullResponse);
    }
  } catch (error) {
    console.error("[ASK_FATAL_ERROR]", error);
    return new Response("Internal server error", {
      status: 500,
    });
  }
}
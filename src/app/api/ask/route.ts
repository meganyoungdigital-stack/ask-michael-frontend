import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import {
  recordUserUsage,
  getUserUsage,
  appendMessageToConversation,
} from "@/lib/mongodb";
import type { Message } from "@/lib/mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, conversationId } = await req.json();

    if (!messages || !conversationId) {
      return new Response("Invalid request", { status: 400 });
    }

    const usageCount = await getUserUsage(userId);
    const DAILY_LIMIT = 50;

    if (usageCount >= DAILY_LIMIT) {
      return new Response("Daily limit reached", { status: 429 });
    }

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        for await (const chunk of stream) {
          const token =
            chunk.choices[0]?.delta?.content || "";

          if (token) {
            fullResponse += token;
            controller.enqueue(encoder.encode(token));
          }
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: fullResponse,
          createdAt: new Date(),
        };

        const latestUserMessage = messages[messages.length - 1];

        await recordUserUsage(userId);

        await appendMessageToConversation(conversationId, {
          ...latestUserMessage,
          createdAt: new Date(),
        });

        await appendMessageToConversation(
          conversationId,
          assistantMessage
        );

        controller.close();
      },
    });

    return new Response(readableStream);
  } catch (error) {
    console.error("[ASK_ERROR]", error);
    return new Response("Internal server error", { status: 500 });
  }
}
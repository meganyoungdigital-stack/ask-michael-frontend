export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import {
  recordUserUsage,
  getUserUsage,
  appendMessageToConversation,
  getConversation,
  connectToDatabase,
} from "@/lib/mongodb";

import type { Db } from "mongodb";

/* ============================
   TYPES
============================ */

type Message = {
  role: "user" | "assistant";
  content: string;
};

type VectorChunk = {
  text: string;
  documentId?: string;
  page?: number;
  score?: number;
};

/* ============================
   LIMIT MESSAGE HISTORY
============================ */

const MAX_MESSAGES = 12;

/* ============================
   DEV DAILY LIMIT
============================ */

const DAILY_FREE_LIMIT = 200;

/* ============================
   DB CACHE
============================ */

let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (!cachedDb) {
    cachedDb = await connectToDatabase();
  }
  return cachedDb;
}

/* ============================
   OPENAI
============================ */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================
   VECTOR SEARCH
============================ */

async function getVectorContext(
  userId: string,
  question: string
): Promise<{ context: string; sources: VectorChunk[] }> {
  try {
    if (!question || question.length < 2) {
      return { context: "", sources: [] };
    }

    const db = await getDb();

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const results = await db
      .collection("document_chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: embedding.data[0].embedding,
            numCandidates: 50,
            limit: 5,
          },
        },
        {
          $match: { userId },
        },
        {
          $project: {
            text: 1,
            documentId: 1,
            page: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    const typedResults = results as unknown as VectorChunk[];

    if (!typedResults.length) {
      return { context: "", sources: [] };
    }

    const context = typedResults
      .map(
        (r, i) =>
          `[Source ${i + 1} | Doc:${r.documentId ?? "unknown"} | Page:${
            r.page ?? "?"
          }]\n${r.text}`
      )
      .join("\n\n");

    return {
      context,
      sources: typedResults,
    };
  } catch (error) {
    console.error("Vector search error:", error);
    return { context: "", sources: [] };
  }
}

/* =====================================================
   MAIN ROUTE
===================================================== */

export async function POST(req: Request) {
  try {
    /* ============================
       AUTH
    ============================ */

    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    /* ============================
       RATE LIMIT
    ============================ */

    const { success } = await ratelimit.limit(userId);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    /* ============================
       PARSE BODY
    ============================ */

    let body;

    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { messages, conversationId } = body;

    if (!Array.isArray(messages) || !conversationId) {
      return new Response("Invalid request body", { status: 400 });
    }

    /* ============================
       TRIM MESSAGE HISTORY
    ============================ */

    const trimmedMessages = messages.slice(-MAX_MESSAGES);

    /* ============================
       VERIFY CONVERSATION
    ============================ */

    const conversation = await getConversation(conversationId, userId);

    if (!conversation) {
      return new Response("Conversation not found", {
        status: 404,
      });
    }

    /* ============================
       USER PLAN
    ============================ */

    const db = await getDb();

    const userRecord = await db.collection("users").findOne({
      userId,
    });

    const isPro = userRecord?.tier === "pro";

    const usageCount = await getUserUsage(userId);

    const limit = isPro ? 2000 : DAILY_FREE_LIMIT;

    if (usageCount >= limit) {
      return new Response(
        JSON.stringify({
          error: "Daily message limit reached",
        }),
        { status: 429 }
      );
    }

    /* ============================
       LAST USER MESSAGE
    ============================ */

    const latestUserMessage: Message = messages[messages.length - 1];

    if (!latestUserMessage?.content) {
      return new Response("Empty message", { status: 400 });
    }

    /* ============================
       DOCUMENT CONTEXT
    ============================ */

    const { context } = await getVectorContext(
      userId,
      latestUserMessage.content
    );

    /* ============================
       BUILD PROMPT
    ============================ */

    const finalMessages = [
      {
        role: "system",
        content:
          "You are an expert engineering AI assistant.\n\n" +
          "Use provided document context when available.\n\n" +
          "Cite references like [Source 1].\n\n" +
          "DOCUMENT CONTEXT:\n" +
          context,
      },
      ...trimmedMessages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    /* ============================
       STREAM AI RESPONSE
    ============================ */

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: finalMessages as any,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          for await (const chunk of completion) {
            const token =
              chunk.choices?.[0]?.delta?.content || "";

            if (token) {
              fullResponse += token;
              controller.enqueue(encoder.encode(token));
            }
          }

          /* SAVE USER MESSAGE */

          await appendMessageToConversation(conversationId, userId, {
            role: "user",
            content: latestUserMessage.content,
            createdAt: new Date(),
          });

          /* SAVE AI RESPONSE */

          await appendMessageToConversation(conversationId, userId, {
            role: "assistant",
            content: fullResponse || "No response generated.",
            createdAt: new Date(),
          });

          /* RECORD USAGE */

          await recordUserUsage(userId);
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
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[ASK_FATAL_ERROR]", error);

    return new Response("Internal server error", {
      status: 500,
    });
  }
}
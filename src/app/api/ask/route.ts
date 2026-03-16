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
  upsertUser,
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

const MAX_MESSAGES = 8;

/* ============================
PLAN LIMITS
============================ */

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 500;

/* ============================
DB CACHE
============================ */

let cachedDb: Db | null = null;

async function getDb(): Promise<Db> {
  if (!cachedDb) {
    const { db } = await connectToDatabase();
    cachedDb = db;
  }
  return cachedDb;
}

/* ============================
OPENAI
============================ */

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ============================
VECTOR SEARCH (SAFE)
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

    const queryVector = embedding.data?.[0]?.embedding;

    if (!queryVector) {
      return { context: "", sources: [] };
    }

    const results = await db
      .collection("document_chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector,
            numCandidates: 20,
            limit: 4,
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await upsertUser(userId);

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

    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { messages, conversationId } = body ?? {};

    if (!Array.isArray(messages) || !conversationId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    /* ============================
    TRIM MESSAGE HISTORY
    ============================ */

    const trimmedMessages = messages.slice(-MAX_MESSAGES);

    /* ============================
    VERIFY CONVERSATION
    ============================ */

    const conversation = await getConversation(
      conversationId,
      userId
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    /* ============================
    USER PLAN
    ============================ */

    const db = await getDb();

    const userRecord = await db
      .collection("users")
      .findOne({ userId });

    const isPro = userRecord?.tier === "pro";

    const usageCount = await getUserUsage(userId);

    const limit = isPro
      ? PRO_DAILY_LIMIT
      : FREE_DAILY_LIMIT;

    if (usageCount >= limit) {
      return NextResponse.json(
        { error: "Daily message limit reached" },
        { status: 429 }
      );
    }

    /* ============================
    LAST USER MESSAGE
    ============================ */

    const latestUserMessage: Message =
      messages[messages.length - 1];

    if (!latestUserMessage?.content) {
      return NextResponse.json(
        { error: "Empty message" },
        { status: 400 }
      );
    }

    /* ============================
    DOCUMENT CONTEXT (SAFE)
    ============================ */

    let context = "";

    try {
      const vectorResult = await getVectorContext(
        userId,
        latestUserMessage.content
      );

      context = vectorResult.context || "";
    } catch (err) {
      console.log("Vector search skipped");
    }

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
      max_tokens: 1200,
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
              controller.enqueue(
                encoder.encode(token)
              );
            }
          }

          await appendMessageToConversation(
            conversationId,
            userId,
            {
              role: "user",
              content: latestUserMessage.content,
              createdAt: new Date(),
            }
          );

          await appendMessageToConversation(
            conversationId,
            userId,
            {
              role: "assistant",
              content:
                fullResponse ||
                "No response generated.",
              createdAt: new Date(),
            }
          );

          await recordUserUsage(userId);
        } catch (err) {
          console.error("Streaming error:", err);

          controller.enqueue(
            encoder.encode(
              "\n\n[AI response interrupted]"
            )
          );
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
  } catch (error: any) {
    console.error("ASK_API_ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
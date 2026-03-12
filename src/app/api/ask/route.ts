export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
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
  createdAt?: Date;
};

/* ============================
   LAZY DB CONNECTION
============================ */

let db: Db | null = null;

async function getDb() {
  if (!db) {
    db = await connectToDatabase();
  }
  return db;
}

/* ============================
   OPENAI CLIENT
============================ */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ============================
   LAZY PDF PARSER
============================ */

let pdfParse: any = null;

async function getPdfParser() {
  if (!pdfParse) {
    const module: any = await import("pdf-parse");
    pdfParse = module.default || module;
  }
  return pdfParse;
}


/* =====================================================
   READ ATTACHMENT TEXT (PDF + TXT + DOC)
===================================================== */

async function getAttachmentText(attachments: any[]) {
  let text = "";

  for (const file of attachments) {
    if (!file?.url) continue;

    try {
      const res = await fetch(file.url);

      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());

      /* PDF SUPPORT */

      if (file.type === "application/pdf") {
        try {
          const pdf = await getPdfParser();
          const pdfData = await pdf(buffer);

          text += `\n\nPDF FILE: ${file.name}\n${pdfData.text}`;
        } catch (err) {
          console.error("PDF parse error:", err);
        }

        continue;
      }

      /* TEXT / OTHER FILES */

      const fileText = buffer.toString("utf-8");

      text += `\n\nFILE: ${file.name}\n${fileText}`;
    } catch (err) {
      console.error("Attachment read error:", err);
    }
  }

  return text;
}

/* =====================================================
   MAIN API ROUTE
===================================================== */

export async function POST(req: Request) {
  try {
    /* AUTH */

    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const safeUserId = userId;

    /* BODY */

    const body = await req.json();
    const { messages, conversationId } = body;

    if (!messages || !conversationId || !Array.isArray(messages)) {
      return new Response("Invalid request body", { status: 400 });
    }

    /* VERIFY CONVERSATION */

    const conversation = await getConversation(
      conversationId,
      safeUserId
    );

    if (!conversation) {
      return new Response("Conversation not found", {
        status: 404,
      });
    }

    /* LOAD ATTACHMENTS */

    const attachments = conversation.attachments || [];
    const documentText = await getAttachmentText(attachments);

    /* USAGE LIMIT */

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

    /* TITLE GENERATION */

    if (conversation.messages.length === 0) {
      try {
        const titleCompletion =
          await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Generate:\n" +
                  "1) Short professional title (3-6 words)\n" +
                  "2) Category from this list:\n" +
                  "ISO 3834, WPS, Welding, Structural Design,\n" +
                  "Steel Connection, Cost Estimation,\n" +
                  "Quality Control, Inspection, General Engineering\n\n" +
                  'Respond ONLY as JSON:\n{"title":"Title","category":"Category"}',
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

        const db = await getDb();

        await db.collection("conversations").updateOne(
          { conversationId, userId: safeUserId },
          {
            $set: {
              title:
                "[" +
                generatedCategory +
                "] " +
                generatedTitle,
              projectType: generatedCategory,
              updatedAt: new Date(),
            },
          }
        );
      } catch (err) {
        console.error("Title generation failed:", err);
      }
    }

    /* BUILD FINAL MESSAGE STACK */

    const finalMessages = [
      {
        role: "system",
        content:
          "You are an engineering AI assistant.\n\n" +
          "If documents are provided, use them to answer the user's question.\n\n" +
          "DOCUMENT CONTENT:\n" +
          documentText,
      },
      ...messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    /* STREAM RESPONSE */

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
              chunk.choices[0]?.delta?.content || "";

            if (token) {
              fullResponse += token;
              controller.enqueue(encoder.encode(token));
            }
          }

          /* SAVE USER MESSAGE */

          await appendMessageToConversation(
            conversationId,
            safeUserId,
            {
              role: "user",
              content: latestUserMessage.content,
              createdAt: new Date(),
            }
          );

          /* SAVE AI RESPONSE */

          await appendMessageToConversation(
            conversationId,
            safeUserId,
            {
              role: "assistant",
              content: fullResponse,
              createdAt: new Date(),
            }
          );

          /* RECORD USAGE */

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
    console.error("[ASK_FATAL_ERROR]", error);

    return new Response("Internal server error", {
      status: 500,
    });
  }
}
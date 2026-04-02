import { NextRequest } from "next/server";    
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

/* ✅ EXISTING */
import { getMessageLimit, hasFeature } from "@/lib/tiers";
export const runtime = "nodejs";

/* ================= OPENAI ================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
/* ================= 🔥 LOCAL DATE FIX ================= */
function getTodayString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const date = `${year}-${month}-${day}`;

  console.log("CHAT API DATE:", date);

  return date;
}
/* ================= 🔒 SANITIZATION ================= */
function sanitizeKnowledge(text: string): string {
  if (!text) return "";

  return text
    .replace(/\b(Pty Ltd|Ltd|Inc|LLC|Corporation|Company)\b/gi, "")
    .replace(/\S+@\S+\.\S+/g, "")
    .replace(/\+?\d[\d\s-]{7,}/g, "")
    .replace(/\b[A-Z]{2,}\b/g, "")
    .trim();
}

/* ================= 🧠 EMBEDDING ================= */
async function createEmbedding(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 2000),
  });

  return res.data[0].embedding;
}

/* ================= 🧠 QUERY HASH ================= */
function hashQuery(query: string) {
  return require("crypto")
    .createHash("md5")
    .update(query.toLowerCase().trim())
    .digest("hex");
}

/* ================= 🧠 VECTOR SEARCH ================= */
async function getRelevantKnowledge(
  db: any,
  message: string,
  company?: string
) {
  try {
    let queryEmbedding: number[] = [];

try {
  queryEmbedding = await createEmbedding(message);
} catch (err) {
  console.error("🚨 EMBEDDING ERROR:", err);
  return { context: "", sources: [] }; // ✅ FAIL SAFE
}

    const results = await db.collection("knowledge_base").aggregate([
      {
        $vectorSearch: {
          index: "default",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
          filter: {
            $or: [
              { company: company || null },
              { company: null }
            ]
          }
        },
      },
    ]).toArray();

    if (!results.length) return { context: "", sources: [] };

    results.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

    const topResults = results.slice(0, 5);

    return {
      context: `
ENGINEERING KNOWLEDGE (MULTI-SOURCE):

${topResults.map((doc: any, i: number) => 
  `SOURCE ${i + 1}:\n${sanitizeKnowledge(doc.content)}`
).join("\n\n")}

INSTRUCTIONS:
- Compare all sources
- Identify best practices
- Resolve conflicts
- Highlight risks if methods differ
- Synthesize into ONE clear engineering answer
`,
      sources: topResults.map((doc: any) => doc._id),
    };

  } catch (err) {
    console.error("Vector search error:", err);
    return { context: "", sources: [] };
  }
}

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

    const params = await context.params;
const { conversationId } = params;

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
- Perform cross-document reasoning
- Identify contradictions between sources
- Highlight engineering risks clearly
- Suggest optimized, real-world solutions
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
    const today = getTodayString();

    const usage = await db.collection("usage").findOne({
      userId,
      date: today,
    });

    const currentUsage = usage?.count || 0;

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
    let mode = "default";

    try {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();

        message = (formData.get("message") as string)?.trim() || "";
        files = (formData.getAll("files") as File[]) || [];
        mode = (formData.get("mode") as string) || "default";
      } else {
        const body = await req.json();
        message = body.message?.trim();
        mode = body.mode || "default";
      }
    } catch {
      return new Response("Invalid request format", { status: 400 });
    }

    if (!message) {
      return new Response("Message required", { status: 400 });
    }

    /* ================= ⚡ QUERY CACHE ================= */
    const queryHash = hashQuery(
      message + (user?.company || "") + mode
    );

    let cached = await db.collection("query_cache").findOne({
      queryHash,
      userId,
    });

    let finalKnowledgeContext = "";
    let cachedResponse = "";
    let sourcesUsed: any[] = [];

    if (cached) {
      console.log("⚡ CACHE HIT");
      finalKnowledgeContext = cached.context || "";
      cachedResponse = cached.response || "";
    } else {
      console.log("🧠 CACHE MISS");

      const knowledge = await getRelevantKnowledge(
        db,
        message,
        user?.company
      );

      finalKnowledgeContext = knowledge.context;
      sourcesUsed = knowledge.sources;

      await db.collection("query_cache").updateOne(
        { queryHash, userId },
        {
          $set: {
            context: finalKnowledgeContext,
            sourcesUsed,
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    /* ================= 🔥 AUTO-CREATE CONVERSATION ================= */
    const existingConversation = await db
      .collection("conversations")
      .findOne({ conversationId, userId });

    if (!existingConversation) {
      await db.collection("conversations").insertOne({
        conversationId,
        userId,
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    /* ================= FEATURE ACCESS ================= */
    const canUsePriority = hasFeature(tier, "priority");

    if (!canUsePriority && files.length > 0) {
      return new Response("File uploads require Pro plan", { status: 403 });
    }

    /* ================= 🔥 FIXED FILE PROCESSING (ONLY CHANGE) ================= */
    let fileContext = "";
    let imageInputs: any[] = [];

    if (files.length > 0) {
      for (const file of files) {
        try {
          if (file.type.startsWith("image/")) {
            const bytes = await file.arrayBuffer();
            const base64 = Buffer.from(bytes).toString("base64");

            // Keep for future vision support, but DO NOT send to OpenAI yet
imageInputs.push(`[IMAGE: ${file.name}]`);

            fileContext += `\n\n[IMAGE: ${file.name}]`;
          } else {
            const text = await file.text();
            fileContext += `\n\n[FILE: ${file.name}]\n${text.slice(0, 2000)}`;
          }
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
    let systemPrompt =
      "You are a professional AI assistant for structural engineering, ISO standards, and technical compliance.\n\n" +
      userContext + "\n\n" +
      companyMemory + "\n\n" +
      finalKnowledgeContext + "\n\n" +
      "STRICT RULES:\n" +
      "- Never mention company names or identifiable details\n" +
      "- Never expose proprietary or sensitive information\n" +
      "- Generalize all knowledge into industry best practices\n\n" +
      "Use any provided file data when relevant.\n\n" +
      "FILE DATA:\n" +
      fileContext;

    if (mode === "iso") {
      systemPrompt += `
ISO GENERATION MODE:
- Always output structured ISO document
Format:
1. Title
2. Scope
3. Responsibilities
4. Procedure
5. Safety
6. References
- Be formal, technical, and compliant
`;
    }

    /* ================= 🔥 USAGE INCREMENT BEFORE STREAM ================= */
    let usageIncremented = false;

    if (!usageIncremented) {
      await db.collection("usage").updateOne(
        { userId, date: today },
        {
          $inc: { count: 1 },
          $setOnInsert: { userId, date: today },
        },
        { upsert: true }
      );
      usageIncremented = true;
    }

    /* ================= STREAMING RESPONSE (UPDATED FOR IMAGES) ================= */

let aiResponse: any;

try {
  aiResponse = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content:
          message +
          (imageInputs.length > 0
            ? "\n\n[User attached images]"
            : ""),
      },
    ],
  });
} catch (err) {
  console.error("🚨 OPENAI ERROR:", err);

  return new Response(
    JSON.stringify({
      error: "AI failed to respond",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

const encoder = new TextEncoder();

return new Response(
  new ReadableStream({
    async start(controller: any) {
      let fullResponse = "";

      try {
        /* ✅ FIXED RESPONSE PARSING (STABLE) */
        try {
          if ((aiResponse as any).output_text) {
            fullResponse = (aiResponse as any).output_text;
          } else if (aiResponse && typeof aiResponse === "object") {
            const output = (aiResponse as any).output;

            if (Array.isArray(output)) {
              for (const item of output) {
                if (item?.content && Array.isArray(item.content)) {
                  for (const c of item.content) {
                    if (c?.type === "output_text" && c?.text) {
                      fullResponse += c.text;
                    }
                  }
                }
              }
            }
          }

          if (!fullResponse || fullResponse.trim() === "") {
            fullResponse = "⚠️ AI response was empty. Please try again.";
          }

        } catch (parseError) {
          console.error("🚨 PARSE FAILURE:", parseError);
          fullResponse = "⚠️ Error generating response.";
        }

        /* ✅ SEND RESPONSE */
        try {
          controller.enqueue(encoder.encode(fullResponse));
        } catch (streamErr) {
          console.error("🚨 STREAM ENQUEUE ERROR:", streamErr);
        }

        /* ✅ SAVE MESSAGE */
        try {
          await db.collection("conversations").updateOne(
            { conversationId, userId },
            {
              $push: {
                messages: {
                  role: "assistant",
                  content: fullResponse,
                  sourcesUsed,
                  createdAt: new Date(),
                },
              },
              $set: { updatedAt: new Date() },
            } as any
          );
        } catch (dbErr) {
          console.error("🚨 DB SAVE ERROR:", dbErr);
        }

        /* ✅ CACHE */
        try {
          await db.collection("query_cache").updateOne(
            { queryHash, userId },
            {
              $set: {
                response: fullResponse,
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
        } catch (cacheErr) {
          console.error("🚨 CACHE ERROR:", cacheErr);
        }

        /* ✅ USAGE SAFETY */
        if (!usageIncremented) {
          await db.collection("usage").updateOne(
            { userId, date: today },
            {
              $inc: { count: 1 },
              $setOnInsert: { userId, date: today },
            },
            { upsert: true }
          );
          usageIncremented = true;
        }

        /* ================= 🧠 AI LEARNING ================= */
        

          /* ================= 🧠 AI LEARNING (SAFE ASYNC - NON BLOCKING) ================= */
(async () => {
  try {
    const learningPrompt = `
Extract reusable engineering knowledge from this response.
Only return if high-quality and generally applicable.
Return concise best-practice knowledge only.

RESPONSE:
${fullResponse}
`;

    const learningRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: learningPrompt,
    });

    let learningText = "";

    if ((learningRes as any).output_text) {
      learningText = (learningRes as any).output_text.trim();
    }

    if (learningText && learningText.length > 50) {
      const embedding = await createEmbedding(learningText);

      await db.collection("ai_learnings").insertOne({
        content: learningText,
        embedding,
        source: "ai_generated",
        confidence: 0.8,
        createdAt: new Date(),
      });
    }

  } catch (err) {
    console.error("AI learning error (non-blocking):", err);
  }
})();

        controller.close();
      } catch (err) {
        console.error("🚨 STREAM FATAL ERROR:", err);
        controller.close();
      }
    },
  }),
  {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  }
);
   } catch (error) {
  console.error("=================================");
  console.error("🚨 CHAT ERROR (FULL)");
  console.error("=================================");
  console.error(error);
  console.error("=================================");

  if (error instanceof Error) {
    console.error("MESSAGE:", error.message);
    console.error("STACK:", error.stack);
  }

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
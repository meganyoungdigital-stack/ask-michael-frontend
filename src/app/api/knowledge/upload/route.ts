import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { hasFeature } from "@/lib/tiers";

export const runtime = "nodejs";

/* ================= OPENAI ================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ================= 🔒 SANITIZE ================= */
function sanitizeContent(text: string): string {
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
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 2000),
  });

  return response.data[0].embedding;
}

/* ================= 🧠 CLASSIFIER ================= */
function classifyContent(text: string): "iso_template" | "repair_procedure" {
  const lower = text.toLowerCase();

  if (
    lower.includes("iso") ||
    lower.includes("scope") ||
    lower.includes("responsibility") ||
    lower.includes("document control")
  ) {
    return "iso_template";
  }

  return "repair_procedure";
}

/* ================= 🧠 TAGGING ================= */
function generateTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  if (lower.includes("weld")) tags.push("welding");
  if (lower.includes("furnace")) tags.push("furnace");
  if (lower.includes("inspection")) tags.push("inspection");
  if (lower.includes("safety")) tags.push("safety");
  if (lower.includes("iso")) tags.push("iso");
  if (lower.includes("maintenance")) tags.push("maintenance");

  return tags.length ? tags : ["general"];
}

/* ================= 🧠 CHUNKING ================= */
function chunkContent(text: string): string[] {
  const sections = text.split(/\n{2,}/);

  const chunks: string[] = [];

  for (const section of sections) {
    const trimmed = section.trim();

    if (trimmed.length > 100) {
      chunks.push(trimmed);
    }
  }

  return chunks.length ? chunks : [text];
}

/* ================= 🧠 STRUCTURE ISO ================= */
function structureISOContent(raw: string): string {
  return `
ISO TEMPLATE STRUCTURE:

1. Title:
${extractSection(raw, "title")}

2. Scope:
${extractSection(raw, "scope")}

3. Responsibilities:
${extractSection(raw, "responsibilities")}

4. Procedure:
${extractSection(raw, "procedure")}

5. Safety:
${extractSection(raw, "safety")}

6. References:
${extractSection(raw, "reference")}
`.trim();
}

/* ================= 🧠 STRUCTURE REPAIR ================= */
function structureRepairContent(raw: string): string {
  return `
REPAIR PROCEDURE:

1. Problem:
${extractSection(raw, "problem")}

2. Root Cause:
${extractSection(raw, "cause")}

3. Tools Required:
${extractSection(raw, "tools")}

4. Step-by-Step Repair:
${extractSteps(raw)}

5. Testing & Validation:
${extractSection(raw, "test")}

6. Safety Notes:
${extractSection(raw, "safety")}
`.trim();
}

/* ================= HELPERS ================= */
function extractSection(text: string, keyword: string): string {
  const regex = new RegExp(`(${keyword}[^\\n]*)([\\s\\S]*?)(\\n\\n|$)`, "i");
  const match = text.match(regex);
  return match ? match[0].trim() : "Not specified";
}

function extractSteps(text: string): string {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  const steps = lines
    .filter((l) => /^\d+[\).\s]/.test(l) || l.toLowerCase().includes("step"))
    .slice(0, 10);

  return steps.length
    ? steps.join("\n")
    : "Step-by-step procedure not clearly defined";
}

/* ================= 🧠 PROCESS IMAGE ================= */
async function processImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "Extract engineering knowledge. Ignore company names. Focus on procedures and structure.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract engineering/ISO content." },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.type};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices?.[0]?.message?.content || "";
}

/* ================= 🧠 PROCESS TEXT ================= */
async function processText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Clean and structure into professional engineering knowledge. Remove sensitive data.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.choices?.[0]?.message?.content || text;
}

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { db } = await connectToDatabase();

    /* 🔥 GET USER FOR COMPANY ISOLATION */
    const user = await db.collection("users").findOne({ userId });

const tier = (user?.tier || "free") as
  | "free"
  | "pro"
  | "pro_plus";

if (!hasFeature(tier, "priority")) {
  return new Response(
    JSON.stringify({
      error:
        "Knowledge base uploads require a Pro or Pro+ plan.",
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

const contentType = req.headers.get("content-type") || "";

    let processedItems: any[] = [];

    /* ================= MULTIPART ================= */
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
const rawFiles = formData.getAll("files");

if (
  !rawFiles.every(
    (file) => file instanceof File
  )
) {
  return new Response(
    "Invalid file upload",
    { status: 400 }
  );
}

if (rawFiles.length > 5) {
  return new Response(
    "Too many files uploaded",
    { status: 400 }
  );
}

const MAX_FILE_SIZE = 16 * 1024 * 1024;

if (
  rawFiles.some(
    (file) => file.size > MAX_FILE_SIZE
  )
) {
  return new Response(
    "One or more files exceed the maximum allowed size",
    { status: 400 }
  );
}

const files = rawFiles as File[];

for (const file of files) {
        let rawContent = "";

        if (file.type.startsWith("image/")) {
          rawContent = await processImage(file);
        } else {
          rawContent = await file.text();
          rawContent = await processText(rawContent);
        }

        const sanitized = sanitizeContent(rawContent);
        const type = classifyContent(sanitized);

        const chunks = chunkContent(sanitized);

        for (const chunk of chunks) {
          const structured =
            type === "iso_template"
              ? structureISOContent(chunk)
              : structureRepairContent(chunk);

          const embedding = await createEmbedding(structured);
          const tags = generateTags(structured);

          processedItems.push({
            type,
            content: structured,
            embedding,
            tags,

            /* 🔥 NEW: COMPANY ISOLATION */
            userId,
            company: user?.company || null,

            createdAt: new Date(),
          });
        }
      }
    } else {
      /* ================= JSON ================= */
      const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return new Response("Invalid request body", {
    status: 400,
  });
}

const { text } = body as {
  text?: unknown;
};

if (typeof text !== "string") {
  return new Response("Invalid content", {
    status: 400,
  });
}

const cleanText = text.trim();

if (cleanText.length === 0) {
  return new Response("No content provided", {
    status: 400,
  });
}

if (cleanText.length > 200000) {
  return new Response(
    "Content exceeds the maximum allowed length",
    { status: 400 }
  );
}

      const processed = await processText(cleanText);
      const sanitized = sanitizeContent(processed);
      const type = classifyContent(sanitized);

      const chunks = chunkContent(sanitized);

      for (const chunk of chunks) {
        const structured =
          type === "iso_template"
            ? structureISOContent(chunk)
            : structureRepairContent(chunk);

        const embedding = await createEmbedding(structured);
        const tags = generateTags(structured);

        processedItems.push({
          type,
          content: structured,
          embedding,
          tags,

          /* 🔥 NEW: COMPANY ISOLATION */
          userId,
          company: user?.company || null,

          createdAt: new Date(),
        });
      }
    }

    /* ================= SAVE ================= */
    if (processedItems.length > 0) {
      await db.collection("knowledge_base").insertMany(processedItems);
    }

    return new Response(
      JSON.stringify({
        success: true,
        chunksStored: processedItems.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[KNOWLEDGE_UPLOAD_ERROR]", error);

    return new Response(
      JSON.stringify({
        error: "Upload failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* =========================
   TEXT CHUNKER (BETTER RAG)
========================= */

const CHUNK_SIZE = 900;
const CHUNK_OVERLAP = 200;

function chunkText(text: string) {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = start + CHUNK_SIZE;
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

/* =========================
   🧠 NEW: SAFE EMBEDDING
========================= */

async function safeCreateEmbedding(input: string) {
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input,
    });

    return res.data[0].embedding;
  } catch (err) {
    console.error("Embedding failed for chunk:", err);
    return null;
  }
}

/* =========================
   🧠 NEW: BATCH EMBEDDINGS
========================= */

async function createEmbeddingsBatch(chunks: string[]) {
  try {
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });

    return res.data.map((d) => d.embedding);
  } catch (err) {
    console.error("Batch embedding failed, falling back to single:", err);

    // fallback to individual processing
    const results: (number[] | null)[] = [];

    for (const chunk of chunks) {
      const emb = await safeCreateEmbedding(chunk);
      results.push(emb);
    }

    return results;
  }
}

/* =========================
   LAZY PDF PARSER
========================= */

let pdfParse: any = null;

async function getPdfParser() {
  if (!pdfParse) {
    const module: any = await import("pdf-parse");
    pdfParse = module.default || module;
  }
  return pdfParse;
}

/* =========================
   GET USER DOCUMENTS
========================= */

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const documents = await db
      .collection("documents")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Document load error:", error);

    return NextResponse.json(
      { error: "Failed to load documents" },
      { status: 500 }
    );
  }
}

/* =========================
   UPLOAD DOCUMENT
========================= */

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.url || !body.name) {
      return NextResponse.json(
        { error: "Missing file information" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    /* =========================
       SAVE DOCUMENT RECORD
    ========================= */

    const result = await db.collection("documents").insertOne({
      userId,
      name: body.name,
      url: body.url,
      type: body.type || "file",
      createdAt: new Date(),
    });

    const documentId = result.insertedId;

    /* =========================
       DOWNLOAD FILE
    ========================= */

    const res = await fetch(body.url);

    if (!res.ok) {
      throw new Error("Failed to download file");
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    let text = "";

    /* =========================
       PARSE PDF
    ========================= */

    if (body.type === "application/pdf") {
      const pdf = await getPdfParser();
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else {
      text = buffer.toString("utf-8");
    }

    if (!text || text.length < 50) {
      throw new Error("Document contains no usable text");
    }

    /* =========================
       CHUNK DOCUMENT
    ========================= */

    const chunks = chunkText(text);

    if (!chunks.length) {
      throw new Error("No valid chunks generated");
    }

    /* =========================
       🚀 CREATE EMBEDDINGS (BATCHED)
    ========================= */

    const embeddings = await createEmbeddingsBatch(chunks);

    const chunkDocuments: any[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = embeddings[i];

      if (!embedding) continue; // skip failed ones

      chunkDocuments.push({
        documentId,
        userId,
        text: chunks[i],
        chunkIndex: i,
        embedding,
        tokenEstimate: Math.ceil(chunks[i].length / 4), // 🔥 useful later
        createdAt: new Date(),
      });
    }

    /* =========================
       STORE CHUNKS
    ========================= */

    if (chunkDocuments.length > 0) {
      await db.collection("document_chunks").insertMany(chunkDocuments);
    }

    return NextResponse.json({
      success: true,
      chunksIndexed: chunkDocuments.length,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE DOCUMENT
========================= */

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const objectId = new ObjectId(id);

    await db.collection("documents").deleteOne({
      _id: objectId,
      userId,
    });

    await db.collection("document_chunks").deleteMany({
      documentId: objectId,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
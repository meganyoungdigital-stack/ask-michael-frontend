import OpenAI from "openai";
import { connectToDatabase } from "@/lib/mongodb";

/* ============================
   OPENAI CLIENT
============================ */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================
   CONFIG
============================ */

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_BATCH = 10;

/* ============================
   TEXT CLEANER
============================ */

function cleanText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

/* ============================
   SPLIT TEXT INTO CHUNKS
============================ */

function splitText(text: string) {
  const chunks: string[] = [];

  let start = 0;

  while (start < text.length) {
    const end = start + CHUNK_SIZE;

    const chunk = text.slice(start, end);

    chunks.push(cleanText(chunk));

    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks.filter(Boolean);
}

/* ============================
   CREATE EMBEDDINGS (BATCH)
============================ */

async function createEmbeddingsBatch(texts: string[]) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((e) => e.embedding);
}

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

/* ============================
   INDEX PDF DOCUMENT
============================ */

export async function indexPdfDocument(
  fileBuffer: Buffer,
  userId: string,
  documentId: string
) {
  const { db } = await connectToDatabase();

  /* ============================
     PARSE PDF
  ============================ */

  const pdf = await getPdfParser();

  const parsed = await pdf(fileBuffer);

  const fullText = parsed.text;

  if (!fullText) {
    throw new Error("PDF contains no text");
  }

  /* ============================
     SPLIT INTO CHUNKS
  ============================ */

  const textChunks = splitText(fullText);

  if (!textChunks.length) {
    throw new Error("No valid text chunks extracted");
  }

  const documents: any[] = [];

  /* ============================
     BATCH EMBEDDINGS
  ============================ */

  for (let i = 0; i < textChunks.length; i += EMBEDDING_BATCH) {
    const batch = textChunks.slice(i, i + EMBEDDING_BATCH);

    const embeddings = await createEmbeddingsBatch(batch);

    for (let j = 0; j < batch.length; j++) {
      documents.push({
        userId,
        documentId,
        chunkIndex: i + j,
        text: batch[j],
        embedding: embeddings[j],
        createdAt: new Date(),
      });
    }
  }

  /* ============================
     INSERT INTO DATABASE
  ============================ */

  if (documents.length) {
    await db.collection("document_chunks").insertMany(documents);
  }

  return {
    chunksIndexed: documents.length,
  };
}
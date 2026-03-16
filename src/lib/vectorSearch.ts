import OpenAI from "openai";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import type { Db } from "mongodb";

/* ============================
   TYPES
============================ */

type VectorChunk = {
  text: string;
  documentId?: string;
  page?: number;
  score?: number;
};

/* ============================
   OPENAI CLIENT
============================ */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ============================
   DB CONNECTION CACHE
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
   QUERY HASH (CACHE KEY)
============================ */

function hashQuery(query: string) {
  return crypto
    .createHash("sha256")
    .update(query.trim().toLowerCase())
    .digest("hex");
}

/* ============================
   CREATE EMBEDDING
============================ */

export async function createEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length < 2) {
    throw new Error("Invalid text for embedding");
  }

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return embedding.data[0].embedding;
}

/* ============================
   VECTOR SEARCH
============================ */

export async function searchDocumentChunks(
  query: string,
  userId: string,
  limit = 5
): Promise<VectorChunk[]> {
  try {
    const db = await getDb();

    const queryEmbedding = await createEmbedding(query);

    const results = (await db
      .collection("document_chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: limit,
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
      .toArray()) as VectorChunk[];

    /* FILTER VERY WEAK RESULTS */

    const filtered = results.filter((r) => (r.score ?? 0) > 0.6);

    return filtered;
  } catch (err) {
    console.error("Vector search failed:", err);
    return [];
  }
}

/* ============================
   BUILD CONTEXT FOR AI
============================ */

export async function buildDocumentContext(
  query: string,
  userId: string
): Promise<string> {
  try {
    const db = await getDb();

    /* ---------- CACHE CHECK ---------- */

    const queryHash = hashQuery(query);

    const cached = await db.collection("query_cache").findOne({
      queryHash,
      userId,
    });

    if (cached?.context) {
      return cached.context;
    }

    /* ---------- VECTOR SEARCH ---------- */

    const chunks = await searchDocumentChunks(query, userId);

    if (!chunks.length) {
      return "";
    }

    const context = chunks
      .map((chunk, i) => {
        return `[Source ${i + 1} | Doc:${chunk.documentId ?? "unknown"}]\n${chunk.text}`;
      })
      .join("\n\n");

    /* ---------- SAVE CACHE ---------- */

    await db.collection("query_cache").updateOne(
      { queryHash, userId },
      {
        $set: {
          context,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return context;
  } catch (err) {
    console.error("Context build error:", err);
    return "";
  }
}
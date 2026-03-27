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
   🧠 COSINE SIMILARITY (NEW)
============================ */

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
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
   🧠 FALLBACK SEARCH (NEW)
============================ */

async function fallbackSearch(
  queryEmbedding: number[],
  userId: string,
  limit: number
): Promise<VectorChunk[]> {
  const db = await getDb();

  const allChunks = await db
    .collection("document_chunks")
    .find({ userId })
    .limit(200) // safety cap
    .toArray();

  const scored = allChunks.map((chunk: any) => {
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);

    return {
      text: chunk.text,
      documentId: chunk.documentId,
      page: chunk.page,
      score,
    };
  });

  return scored
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}

/* ============================
   🧠 HYBRID SEARCH (NEW)
============================ */

function keywordBoost(query: string, text: string) {
  const q = query.toLowerCase().split(" ");
  const t = text.toLowerCase();

  let score = 0;

  for (const word of q) {
    if (t.includes(word)) score += 0.05;
  }

  return score;
}

/* ============================
   VECTOR SEARCH (UPGRADED)
============================ */

export async function searchDocumentChunks(
  query: string,
  userId: string,
  limit = 5
): Promise<VectorChunk[]> {
  try {
    const db = await getDb();

    const queryEmbedding = await createEmbedding(query);

    let results: VectorChunk[] = [];

    try {
      /* ---------- PRIMARY: MONGO VECTOR ---------- */

      results = (await db
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
    } catch (err) {
      console.warn("Mongo vector failed, using fallback...");
      results = await fallbackSearch(queryEmbedding, userId, limit);
    }

    /* ---------- HYBRID BOOST ---------- */

    results = results.map((r) => ({
      ...r,
      score:
        (r.score || 0) +
        keywordBoost(query, r.text),
    }));

    /* ---------- FILTER ---------- */

    const filtered = results.filter(
      (r) => (r.score ?? 0) > 0.6
    );

    /* ---------- SORT ---------- */

    return filtered.sort(
      (a, b) => (b.score || 0) - (a.score || 0)
    );
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

    const queryHash = hashQuery(query);

    const cached = await db.collection("query_cache").findOne({
      queryHash,
      userId,
    });

    if (cached?.context) {
      return cached.context;
    }

    const chunks = await searchDocumentChunks(query, userId);

    if (!chunks.length) {
      return "";
    }

    let context = chunks
      .map((chunk, i) => {
        return `[Source ${i + 1} | Score:${(chunk.score || 0).toFixed(
          2
        )} | Doc:${chunk.documentId ?? "unknown"}]\n${chunk.text}`;
      })
      .join("\n\n");

    /* ---------- CONTEXT LIMIT ---------- */

    if (context.length > 10000) {
      context = context.slice(0, 10000);
    }

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
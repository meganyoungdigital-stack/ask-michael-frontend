import { MongoClient, ObjectId, Db } from "mongodb";

/* ============================
ENVIRONMENT
============================ */

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

/* ============================
CONNECTION OPTIONS
============================ */

const options = {
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4 as const,
};

/* ============================
GLOBAL CLIENT CACHE
============================ */

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/* ============================
DATABASE HELPER
============================ */

let indexesInitialized = false;

async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const db = client.db("ask-michael");

  if (!indexesInitialized) {
    await Promise.all([
      db.collection("usage").createIndex({ userId: 1 }, { unique: true }),

      db.collection("conversations").createIndex({ userId: 1 }),

      db.collection("conversations").createIndex(
        { conversationId: 1 },
        { unique: true }
      ),

      db.collection("document_chunks").createIndex({ userId: 1 }),

      /* NEW: query cache index for vector search optimization */
      db.collection("query_cache").createIndex(
        { queryHash: 1, userId: 1 },
        { unique: true }
      ),
    ]);

    indexesInitialized = true;
  }

  return db;
}

export async function connectToDatabase(): Promise<{ db: Db }> {
  const db = await getDb();
  return { db };
}

/* ============================
TYPES
============================ */

export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

interface Conversation {
  _id?: ObjectId;
  conversationId: string;
  userId: string;
  title: string;
  projectType: string;
  isoMode: boolean;
  starred?: boolean;
  messages: Message[];
  attachments?: Attachment[];
  shareId?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface Usage {
  _id?: ObjectId;
  userId: string;
  count: number;
  lastReset: Date;
}

interface User {
  _id?: ObjectId;
  userId: string;
  tier: "free" | "pro";
  createdAt: Date;
}

export interface DocumentChunk {
  _id?: ObjectId;
  documentId: ObjectId;
  userId: string;
  text: string;
  embedding: number[];
  createdAt: Date;
}

/* NEW TYPE: QUERY CACHE */

export interface QueryCache {
  _id?: ObjectId;
  queryHash: string;
  userId: string;
  context: string;
  createdAt: Date;
}

/* ============================
CONVERSATION FUNCTIONS
============================ */

export async function createConversation(userId: string) {
  const db = await getDb();
  const conversationId = new ObjectId().toString();

  await db.collection<Conversation>("conversations").insertOne({
    conversationId,
    userId,
    title: "New Conversation",
    projectType: "General",
    isoMode: false,
    starred: false,
    messages: [],
    attachments: [],
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return conversationId;
}

export async function getConversation(
  conversationId: string,
  userId: string
) {
  const db = await getDb();

  return db
    .collection<Conversation>("conversations")
    .findOne({ conversationId, userId });
}

export async function getPublicConversation(shareId: string) {
  const db = await getDb();

  return db.collection<Conversation>("conversations").findOne({
    shareId,
    isPublic: true,
  });
}

export async function makeConversationPublic(
  conversationId: string,
  userId: string,
  shareId: string
) {
  const db = await getDb();

  const result = await db
    .collection<Conversation>("conversations")
    .updateOne(
      { conversationId, userId },
      {
        $set: {
          isPublic: true,
          shareId,
          updatedAt: new Date(),
        },
      }
    );

  return result.matchedCount > 0;
}

export async function getUserConversations(userId: string) {
  const db = await getDb();

  const conversations = await db
    .collection<Conversation>("conversations")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return conversations.map((conv) => ({
    conversationId: conv.conversationId,
    title: conv.title || "Untitled Chat",
    starred: conv.starred || false,
  }));
}

export async function appendMessageToConversation(
  conversationId: string,
  userId: string,
  message: Message
) {
  const db = await getDb();

  await db.collection<Conversation>("conversations").updateOne(
    { conversationId, userId },
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() },
    }
  );
}

/* ============================
USER FUNCTIONS
============================ */

export async function getUser(userId: string) {
  const db = await getDb();
  return db.collection<User>("users").findOne({ userId });
}

export async function upsertUser(userId: string) {
  const db = await getDb();

  await db.collection<User>("users").updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
        tier: "free",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function updateUserTier(
  userId: string,
  tier: "free" | "pro"
) {
  const db = await getDb();

  await db.collection<User>("users").updateOne(
    { userId },
    {
      $set: { tier },
    }
  );
}

/* ============================
USAGE TRACKING
============================ */

export async function getUserUsage(userId: string) {
  const db = await getDb();

  const usage = await db.collection<Usage>("usage").findOne({ userId });

  const now = new Date();

  if (!usage) {
    await db.collection<Usage>("usage").insertOne({
      userId,
      count: 0,
      lastReset: now,
    });

    return 0;
  }

  const hoursSinceReset =
    (now.getTime() - new Date(usage.lastReset).getTime()) /
    (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    await db.collection<Usage>("usage").updateOne(
      { userId },
      {
        $set: {
          count: 0,
          lastReset: now,
        },
      }
    );

    return 0;
  }

  return usage.count;
}

export async function recordUserUsage(userId: string) {
  const db = await getDb();

  await db.collection<Usage>("usage").updateOne(
    { userId },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        lastReset: new Date(),
      },
    },
    { upsert: true }
  );
}

/* ============================
DOCUMENT VECTOR FUNCTIONS
============================ */

export async function insertDocumentChunk(chunk: DocumentChunk) {
  const db = await getDb();

  return db
    .collection<DocumentChunk>("document_chunks")
    .insertOne(chunk);
}

export async function deleteDocumentChunks(
  documentId: ObjectId,
  userId: string
) {
  const db = await getDb();

  return db
    .collection<DocumentChunk>("document_chunks")
    .deleteMany({
      documentId,
      userId,
    });
}

/* ============================
ATTACHMENT FUNCTIONS
============================ */

export async function addAttachmentToConversation(
  conversationId: string,
  userId: string,
  attachment: Attachment
) {
  const db = await getDb();

  return db.collection<Conversation>("conversations").updateOne(
    { conversationId, userId },
    {
      $push: { attachments: attachment },
      $set: { updatedAt: new Date() },
    }
  );
}

/* ============================
GET CONVERSATIONS FOR USER
============================ */

export async function getConversationsForUser(userId: string) {
  const db = await getDb();

  return db
    .collection<Conversation>("conversations")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
}

/* ============================
UPDATE CONVERSATION TITLE
============================ */

export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
) {
  const db = await getDb();

  return db.collection<Conversation>("conversations").updateOne(
    { conversationId, userId },
    {
      $set: {
        title,
        updatedAt: new Date(),
      },
    }
  );
}

/* ============================
QUERY CACHE FUNCTIONS
============================ */

export async function getCachedQueryContext(
  queryHash: string,
  userId: string
) {
  const db = await getDb();

  return db.collection<QueryCache>("query_cache").findOne({
    queryHash,
    userId,
  });
}

export async function saveQueryContext(
  queryHash: string,
  userId: string,
  context: string
) {
  const db = await getDb();

  return db.collection<QueryCache>("query_cache").updateOne(
    { queryHash, userId },
    {
      $set: {
        context,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}
import { MongoClient, ObjectId } from "mongodb";

/* ============================
   ENVIRONMENT
============================ */

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to environment variables");
}

/* ============================
   MONGODB CONNECTION (SAFE POOLING)
============================ */

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

/* ============================
   DATABASE HELPER
============================ */

async function getDb() {
  const client = await clientPromise;
  return client.db("ask-michael");
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
  createdAt: Date;
  updatedAt?: Date;
}

interface Usage {
  _id?: ObjectId;
  userId: string;
  count: number;
}

interface User {
  _id?: ObjectId;
  userId: string;
  tier: "free" | "pro";
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

/* 🔥 REQUIRED FOR YOUR PROJECT ROUTE */
export async function getConversationsForUser(userId: string) {
  const db = await getDb();

  return db
    .collection<Conversation>("conversations")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
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

export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string,
  projectType?: string
) {
  const db = await getDb();

  await db.collection<Conversation>("conversations").updateOne(
    { conversationId, userId },
    {
      $set: {
        title,
        projectType,
        updatedAt: new Date(),
      },
    }
  );
}

/* 🔥 NEW — ATTACHMENT FUNCTION */
export async function addAttachmentToConversation(
  conversationId: string,
  userId: string,
  attachment: Attachment
) {
  const db = await getDb();

  await db.collection<Conversation>("conversations").updateOne(
    { conversationId, userId },
    {
      $push: { attachments: attachment },
      $set: { updatedAt: new Date() },
    }
  );
}

/* ============================
   USER / TIER FUNCTIONS
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

  const usage = await db
    .collection<Usage>("usage")
    .findOne({ userId });

  return usage?.count ?? 0;
}

export async function recordUserUsage(userId: string) {
  const db = await getDb();

  await db.collection<Usage>("usage").updateOne(
    { userId },
    { $inc: { count: 1 } },
    { upsert: true }
  );
}

/* ============================
   DIRECT DB ACCESS (OPTIONAL)
============================ */

export async function connectToDatabase() {
  const client = await clientPromise;
  return client.db("ask-michael");
}
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

/* ✅ IMPORTANT: Default export for API routes */
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

interface Conversation {
  _id?: ObjectId;
  conversationId: string;
  userId: string;
  title: string;
  projectType: string;
  isoMode: boolean;
  starred?: boolean;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
}

interface Usage {
  _id?: ObjectId;
  userId: string;
  count: number;
}

/* ============================
   CONVERSATION FUNCTIONS
============================ */

export async function saveConversation(
  conversationId: string,
  userId: string,
  messages: Message[],
  title: string,
  projectType: string,
  isoMode: boolean
) {
  const db = await getDb();

  await db.collection<Conversation>("conversations").insertOne({
    conversationId,
    userId,
    title,
    projectType,
    isoMode,
    starred: false,
    messages,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

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
  message: Message
) {
  const db = await getDb();

  await db
    .collection<Conversation>("conversations")
    .updateOne(
      { conversationId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() },
      }
    );
}

/* ============================
   DIRECT DB ACCESS
============================ */

export async function connectToDatabase() {
  const client = await clientPromise;
  return client.db("ask-michael");
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

  await db
    .collection<Usage>("usage")
    .updateOne(
      { userId },
      { $inc: { count: 1 } },
      { upsert: true }
    );
}
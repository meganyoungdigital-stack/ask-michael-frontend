import { MongoClient, ObjectId } from "mongodb";

/* ============================
   ENVIRONMENT
============================ */

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env.local");
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
  starred?: boolean; // ✅ Added for star feature
  messages: Message[];
  createdAt: Date;
}

interface Usage {
  _id?: ObjectId;
  userId: string;
  count: number;
}

/* ============================
   CONVERSATION FUNCTIONS
============================ */

/**
 * NEW — Used by /new/route.ts
 */
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
    starred: false, // default value
    messages,
    createdAt: new Date(),
  });
}

/**
 * Legacy create (still safe to keep)
 */
export async function createConversation(userId: string) {
  const db = await getDb();

  const result = await db
    .collection<Conversation>("conversations")
    .insertOne({
      conversationId: new ObjectId().toString(),
      userId,
      title: "New Conversation",
      projectType: "General",
      isoMode: false,
      starred: false,
      messages: [],
      createdAt: new Date(),
    });

  return result.insertedId.toString();
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

export async function getConversationsForUser(userId: string) {
  const db = await getDb();

  return db
    .collection<Conversation>("conversations")
    .find({ userId })
    .sort({ createdAt: -1 })
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
        $push: {
          messages: message,
        },
      }
    );
}

/* ============================
   DIRECT DB ACCESS (for custom routes like star)
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
      {
        $inc: { count: 1 },
      },
      { upsert: true }
    );
}
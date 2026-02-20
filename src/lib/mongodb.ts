import { MongoClient, Db } from 'mongodb';

/* =========================
   ENV
========================= */

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error('MONGODB_URI is not defined');
}

/* =========================
   GLOBAL CONNECTION CACHE
========================= */

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

/* =========================
   CONNECT
========================= */

export async function connectToDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('askmichael');
}

/* =========================
   TYPES
========================= */

export interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export type ProjectType =
  | "Superstructure"
  | "Pot Shell"
  | "Structural Frame"
  | "Welding Procedure"
  | "Cost Estimate"
  | "General";

export interface Conversation {
  conversationId: string;
  userId: string;
  title: string;
  projectType: ProjectType;
  isoMode: boolean;
  starred: boolean; // ✅ ADDED
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUsage {
  userId: string;
  messageCount: number;
  totalRequests: number;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================
   USER USAGE
========================= */

export async function recordUserUsage(userId: string) {
  const db = await connectToDatabase();
  const collection = db.collection<UserUsage>('user_usage');

  return collection.findOneAndUpdate(
    { userId },
    {
      $inc: { messageCount: 1, totalRequests: 1 },
      $set: { updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function getUserUsage(userId: string) {
  const db = await connectToDatabase();
  return db.collection<UserUsage>('user_usage').findOne({ userId });
}

/* =========================
   CONVERSATIONS
========================= */

export async function saveConversation(
  conversationId: string,
  userId: string,
  messages: Message[],
  title: string = "New Project",
  projectType: ProjectType = "General",
  isoMode: boolean = false
) {
  const db = await connectToDatabase();
  const collection = db.collection<Conversation>('conversations');

  return collection.findOneAndUpdate(
    { conversationId, userId },
    {
      $set: {
        messages,
        title,
        projectType,
        isoMode,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
        conversationId,
        userId,
        starred: false, // ✅ ENSURES DEFAULT
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function appendMessageToConversation(
  conversationId: string,
  userId: string,
  newMessages: Message[]
) {
  const db = await connectToDatabase();
  const collection = db.collection<Conversation>('conversations');

  return collection.findOneAndUpdate(
    { conversationId, userId },
    {
      $push: {
        messages: {
          $each: newMessages.map((m) => ({
            ...m,
            createdAt: new Date(),
          })),
        },
      },
      $set: { updatedAt: new Date() },
      $setOnInsert: {
        createdAt: new Date(),
        conversationId,
        userId,
        title: "New Project",
        projectType: "General",
        isoMode: false,
        starred: false, // ✅ ENSURES DEFAULT
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
}

export async function getConversation(
  conversationId: string,
  userId: string
) {
  const db = await connectToDatabase();
  return db
    .collection<Conversation>('conversations')
    .findOne({ conversationId, userId });
}

export async function getConversationsForUser(userId: string) {
  const db = await connectToDatabase();
  return db
    .collection<Conversation>('conversations')
    .find({ userId })
    .sort({ starred: -1, updatedAt: -1 }) // ✅ PINNED FIRST
    .toArray();
}
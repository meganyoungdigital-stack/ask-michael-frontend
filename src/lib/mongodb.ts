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

async function connectToDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('askmichael');
}

/* =========================
   TYPES
========================= */

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  conversationId: string;
  userId: string;
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
  messages: Message[]
) {
  const db = await connectToDatabase();
  const collection = db.collection<Conversation>('conversations');

  return collection.findOneAndUpdate(
    { conversationId, userId },
    {
      $set: {
        messages,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
        conversationId,
        userId,
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
      $push: { messages: { $each: newMessages } },
      $set: { updatedAt: new Date() },
      $setOnInsert: {
        createdAt: new Date(),
        conversationId,
        userId,
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
    .sort({ updatedAt: -1 })
    .toArray();
}

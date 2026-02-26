import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ conversations: [] });
  }

  const client = await clientPromise;
  const db = client.db();

  const conversations = await db
    .collection("conversations")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      conversationId: c._id.toString(),
      title: c.title || "Untitled",
      starred: c.starred || false,
    })),
  });
}
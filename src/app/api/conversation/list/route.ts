import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ conversations: [] });
    }

    const { db } = await connectToDatabase();

    const conversations = await db
      .collection("conversations")
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      conversations: conversations.map((c: any) => ({
        conversationId: c.conversationId,
        title: c.title || "Untitled",
        starred: c.starred || false,
      })),
    });
  } catch (error) {
    // Conversation list failure handled without exposing internal error details.

    return NextResponse.json({ conversations: [] });
  }
}

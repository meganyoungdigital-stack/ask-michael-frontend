import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const conversationId = new ObjectId().toString();

    await db.collection("conversations").insertOne({
      conversationId,
      userId,
      messages: [],
      attachments: [],
      createdAt: new Date(),
    });

    return NextResponse.json({ conversationId });

  } catch (error) {

    console.error("Create conversation error:", error);

    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );

  }
}
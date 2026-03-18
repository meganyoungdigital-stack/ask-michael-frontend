import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

/* ================= POST ================= */
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

    const conversationId = randomUUID();

    /* ================= CREATE CONVERSATION ================= */
    await db.collection("conversations").insertOne({
      conversationId,
      userId,
      title: "New Chat", // ✅ required for auto rename
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ conversationId });

  } catch (error) {
    console.error("NEW CONVERSATION ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
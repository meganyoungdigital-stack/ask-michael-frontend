import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {

  const db = await connectToDatabase();

  const { conversationId, name, url, type } = await req.json();

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  const result = await db.collection("conversations").updateOne(
  { conversationId },
  {
    $push: {
      attachments: {
        name,
        url,
        type,
        uploadedAt: new Date(),
      },
    },
    $set: { updatedAt: new Date() },
  } as any
);

  if (!result.matchedCount) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });

}
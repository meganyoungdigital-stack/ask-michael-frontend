import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;

  const db = await connectToDatabase();
  const collection = db.collection("conversations");

  const conversation = await collection.findOne({ conversationId });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await collection.updateOne(
    { conversationId },
    { $set: { starred: !conversation.starred } }
  );

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { title } = await req.json();
  const { conversationId } = params;
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await connectToDatabase();
  const collection = db.collection("conversations");

  await collection.updateOne(
    { conversationId, userId },
    { $set: { title, updatedAt: new Date() } }
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await connectToDatabase();
  const collection = db.collection("conversations");

  await collection.deleteOne({ conversationId, userId });

  return NextResponse.json({ success: true });
}

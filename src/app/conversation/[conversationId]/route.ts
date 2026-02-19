import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// RENAME CONVERSATION
export async function PATCH(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { title } = await req.json();

    const db = await connectToDatabase();

    await db.collection("conversations").updateOne(
      { _id: new ObjectId(params.conversationId) },
      { $set: { title } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Rename failed" }, { status: 500 });
  }
}

// DELETE CONVERSATION
export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const db = await connectToDatabase();

    await db.collection("conversations").deleteOne({
      _id: new ObjectId(params.conversationId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

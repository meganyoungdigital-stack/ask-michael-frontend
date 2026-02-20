import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await context.params;
    const body = await req.json();

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const db = await connectToDatabase();

    await db.collection("projects").updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: body }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await context.params;

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const db = await connectToDatabase();

    await db.collection("projects").deleteOne({
      _id: new ObjectId(conversationId),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

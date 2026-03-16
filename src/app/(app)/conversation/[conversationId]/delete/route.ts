import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {

    const { conversationId } = await context.params;

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    await db.collection("conversations").deleteOne({
      conversationId,
      userId,
    });

    return NextResponse.json({ success: true });

  } catch {

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );

  }
}
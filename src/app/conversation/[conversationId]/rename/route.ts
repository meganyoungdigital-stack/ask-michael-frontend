import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(
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

    const body = await req.json();
    const title = body.title;

    const db = await connectToDatabase();

    await db.collection("conversations").updateOne(
      { conversationId, userId },
      {
        $set: {
          title,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });

  } catch {

    return NextResponse.json(
      { error: "Rename failed" },
      { status: 500 }
    );

  }
}
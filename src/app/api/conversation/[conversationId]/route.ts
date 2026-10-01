import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

/* ================= GET ================= */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Correct handling for Next.js 16
    const { conversationId } = await context.params;

if (
  typeof conversationId !== "string" ||
  conversationId.length === 0 ||
  conversationId.length > 200
) {
  return NextResponse.json(
    { error: "Invalid conversation ID" },
    { status: 400 }
  );
}

const { db } = await connectToDatabase();

    const conversation = await db
      .collection("conversations")
      .findOne({ conversationId, userId });

    if (!conversation) {
  /* ✅ AUTO CREATE (THIS FIXES YOUR 404) */
  await db.collection("conversations").insertOne({
    conversationId,
    userId,
    title: "New Chat",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({
    messages: [],
  });
}

    return NextResponse.json(
  conversation.messages || [],
  { status: 200 }
);
  } catch {
  return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}

/* ================= PATCH ================= */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversationId } = await context.params;

    const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    {
      error: "Invalid request body",
    },
    {
      status: 400,
    }
  );
}

const allowedFields = [
  "title",
  "messages",
  "starred",
];

const updateData: Record<string, unknown> = {};

for (const field of allowedFields) {
  if (field in body) {
    updateData[field] = body[field];
  }
}

updateData.updatedAt = new Date();

const { db } = await connectToDatabase();

const result = await db.collection("conversations").updateOne(
  {
    conversationId,
    userId,
  },
  {
    $set: updateData,
  }
);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
  return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { conversationId } = await context.params;

    const { db } = await connectToDatabase();

    const result = await db.collection("conversations").deleteOne({
      conversationId,
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
  return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
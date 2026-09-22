import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

/* ================= POST ================= */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { db } = await connectToDatabase();

    const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return new Response("Invalid request body", {
    status: 400,
  });
}

const {
  conversationId,
  messageId,
  rating,
  comment,
} = body as {
  conversationId?: unknown;
  messageId?: unknown;
  rating?: unknown;
  comment?: unknown;
};

if (
  typeof conversationId !== "string" ||
  typeof messageId !== "string" ||
  typeof rating !== "number" ||
  !Number.isFinite(rating) ||
  (comment !== undefined && typeof comment !== "string")
) {
  return new Response("Invalid payload", {
    status: 400,
  });
}

const cleanConversationId = conversationId.trim();
const cleanMessageId = messageId.trim();
const cleanComment =
  comment?.trim() || "";

if (
  cleanConversationId.length === 0 ||
  cleanMessageId.length === 0
) {
  return new Response("Invalid payload", {
    status: 400,
  });
}

if (
  cleanConversationId.length > 200 ||
  cleanMessageId.length > 200 ||
  cleanComment.length > 5000
) {
  return new Response(
    "Feedback fields exceed the maximum allowed length",
    { status: 400 }
  );
}

if (rating !== 1 && rating !== -1) {
  return new Response("Invalid rating", {
    status: 400,
  });
}

    /* ================= GET MESSAGE ================= */
    const conversation = await db.collection("conversations").findOne({
      conversationId,
      userId,
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    const message = conversation.messages?.find(
      (m: any) => m._id?.toString?.() === messageId
    );

    if (!message) {
      return new Response("Message not found", { status: 404 });
    }

    const sourcesUsed = message.sourcesUsed || [];

    /* ================= SAVE FEEDBACK ================= */
    await db.collection("feedback").insertOne({
      userId,
      conversationId,
      messageId,
      rating,
      comment: comment || "",
      createdAt: new Date(),
    });

    /* ================= UPDATE KNOWLEDGE ================= */
    if (sourcesUsed.length > 0) {
      await db.collection("knowledge_base").updateMany(
        { _id: { $in: sourcesUsed } },
        {
          $inc: {
            score: rating,
            uses: 1,
            success: rating > 0 ? 1 : 0,
          },
        }
      );
    }

    /* ================= UPDATE CACHE RANKING ================= */
    try {
      const queryCacheEntry = await db.collection("query_cache").findOne({
        userId,
        "sourcesUsed": { $in: sourcesUsed },
      });

      if (queryCacheEntry) {
        await db.collection("query_cache").updateOne(
          { _id: queryCacheEntry._id },
          {
            $inc: {
              ratingScore: rating,
              hits: 1,
            },
          }
        );
      }
    } catch (err) {
      console.error("Cache ranking error:", err);
    }

    /* ================= OPTIONAL: FLAG BAD RESPONSES ================= */
    if (rating < 0) {
      await db.collection("bad_responses").insertOne({
        userId,
        conversationId,
        messageId,
        sourcesUsed,
        createdAt: new Date(),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("[FEEDBACK_ERROR]", error);

    return new Response(
      JSON.stringify({
        error: "Feedback failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
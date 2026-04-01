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

    const {
      conversationId,
      messageId,
      rating, // +1 or -1
      comment,
    } = body;

    if (!conversationId || !messageId || typeof rating !== "number") {
      return new Response("Invalid payload", { status: 400 });
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
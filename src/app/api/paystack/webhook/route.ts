import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

/* ============================
WEBHOOK HANDLER
============================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return new NextResponse("No signature", { status: 400 });
    }

    /* ============================
    ENV VALIDATION (ADDED SAFELY)
    ============================ */

    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("❌ PAYSTACK_SECRET_KEY is not set");
      return new NextResponse("Server misconfigured", { status: 500 });
    }

    /* ============================
    VERIFY SIGNATURE (CRITICAL)
    ============================ */

    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid Paystack signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    const { db } = await connectToDatabase();

    /* ============================
    IDEMPOTENCY CHECK (CRITICAL)
    ============================ */

    const eventId = event?.data?.id || event?.data?.reference;

    if (eventId) {
      const existingEvent = await db.collection("webhook_events").findOne({
        eventId,
      });

      if (existingEvent) {
        return new NextResponse("Already processed", { status: 200 });
      }

      await db.collection("webhook_events").insertOne({
        eventId,
        type: event.event,
        createdAt: new Date(),
      });
    }

    /* ============================
    HANDLE EVENTS
    ============================ */

    switch (event.event) {
      case "charge.success": {
        const data = event.data;

        const reference = data.reference;
        const status = data.status;

        if (!reference || status !== "success") {
          console.warn("⚠️ Invalid charge event");
          break;
        }

        console.log("✅ Payment success:", reference);

        const metadata = data.metadata || {};
        const userId = metadata.userId;
        const plan = metadata.plan;

        if (!userId || !plan) {
          console.warn("⚠️ Missing metadata — skipping upgrade");
          break;
        }

        let tier: "free" | "pro" | "pro_plus" = "free";

        if (plan === "pro") tier = "pro";
        if (plan === "pro_plus") tier = "pro_plus";

        await db.collection("users").updateOne(
          { userId },
          {
            $set: {
              tier,
              subscriptionStatus: "active",
              updatedAt: new Date(),
            },
          }
        );

        /* ============================
        STORE TRANSACTION
        ============================ */

        await db.collection("transactions").updateOne(
          { reference },
          {
            $set: {
              reference,
              userId,
              tier,
              amount: data.amount,
              email: data.customer?.email,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

        break;
      }

      case "subscription.create":
      case "subscription.enable": {
        const data = event.data;
        const metadata = data.metadata || {};

        const userId = metadata.userId;
        const plan = metadata.plan;

        if (!userId || !plan) break;

        let tier: "free" | "pro" | "pro_plus" = "free";

        if (plan === "pro") tier = "pro";
        if (plan === "pro_plus") tier = "pro_plus";

        await db.collection("users").updateOne(
          { userId },
          {
            $set: {
              tier,
              subscriptionStatus: "active",
              updatedAt: new Date(),
            },
          }
        );

        break;
      }

      case "invoice.payment_succeeded": {
        const data = event.data;
        const metadata = data.metadata || {};

        const userId = metadata.userId;

        if (!userId) break;

        await db.collection("users").updateOne(
          { userId },
          {
            $set: {
              subscriptionStatus: "active",
              lastPaymentAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        break;
      }

      case "subscription.disable": {
        const data = event.data;
        const metadata = data.metadata || {};

        const userId = metadata.userId;

        if (!userId) break;

        await db.collection("users").updateOne(
          { userId },
          {
            $set: {
              tier: "free",
              subscriptionStatus: "cancelled",
              updatedAt: new Date(),
            },
          }
        );

        break;
      }

      default:
        console.log("Unhandled event:", event.event);
    }

    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("🔥 WEBHOOK ERROR:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
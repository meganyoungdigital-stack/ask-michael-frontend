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
    VERIFY SIGNATURE (CRITICAL)
    ============================ */

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid Paystack signature");
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    const { db } = await connectToDatabase();

    /* ============================
    HANDLE EVENTS
    ============================ */

    switch (event.event) {
      case "charge.success": {
        const data = event.data;

        const email = data.customer?.email;
        const reference = data.reference;

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

        break;
      }

      /* ============================
      SUBSCRIPTION CREATED / ENABLED
      ============================ */
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

      /* ============================
      SUBSCRIPTION RENEWAL
      ============================ */
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
            },
          }
        );

        break;
      }

      /* ============================
      SUBSCRIPTION CANCELLED
      ============================ */
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
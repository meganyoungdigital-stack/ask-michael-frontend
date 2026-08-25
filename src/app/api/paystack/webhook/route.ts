import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

        /* =====================================================
        PARTNER PAYMENT
        ===================================================== */

        const partnerId = metadata.partnerId;
        const paymentType = metadata.paymentType;

        if (
          partnerId &&
          paymentType === "partner_subscription"
        ) {
          console.log(
            "✅ Partner subscription payment:",
            partnerId
          );

          /* ==========================================
          FIND PARTNER PAYMENT
          ========================================== */

          const partnerPayment =
            await db.collection("partner_payments").findOne({
              reference,
            });

          if (!partnerPayment) {
            console.warn(
              "⚠️ Partner payment record not found:",
              reference
            );

            break;
          }

          /* ==========================================
          PREVENT DUPLICATE PAYMENT PROCESSING
          ========================================== */

          if (partnerPayment.status === "paid") {
            console.log(
              "ℹ️ Partner payment already processed:",
              reference
            );

            break;
          }

          /* ==========================================
          VALIDATE PARTNER
          ========================================== */

          const partner = await db
            .collection("partners")
            .findOne({
              _id: partnerPayment.partnerId,
            });

          if (!partner) {
            console.warn(
              "⚠️ Partner not found:",
              partnerId
            );

            break;
          }

          /* ==========================================
          MARK PAYMENT AS PAID
          ========================================== */

          await db
            .collection("partner_payments")
            .updateOne(
              {
                reference,
              },
              {
                $set: {
                  status: "paid",
                  paidAt: new Date(),
                  paystackTransactionId:
                    data.id || null,
                  gatewayResponse:
                    data.gateway_response || null,
                  updatedAt: new Date(),
                },
              }
            );

          /* ==========================================
          ACTIVATE PARTNER SUBSCRIPTION
          ========================================== */

          const nextBillingDate = new Date();

          nextBillingDate.setMonth(
            nextBillingDate.getMonth() + 1
          );

          await db
            .collection("partners")
            .updateOne(
              {
                _id: partnerPayment.partnerId,
              },
              {
                $set: {
                  subscriptionStatus: "active",
                  paymentStatus: "paid",
                  lastPaymentAt: new Date(),
                  nextBillingDate,
                  updatedAt: new Date(),
                },
              }
            );

          /* ==========================================
          STORE PARTNER TRANSACTION
          ========================================== */

          await db
            .collection("partner_transactions")
            .updateOne(
              {
                reference,
              },
              {
                $set: {
                  reference,
                  partnerId:
                    partnerPayment.partnerId,
                  plan:
                    partnerPayment.plan || null,
                  amount: data.amount,
                  currency:
                    data.currency ||
                    partnerPayment.currency,
                  email:
                    data.customer?.email ||
                    partner.email,
                  paymentType:
                    "partner_subscription",
                  status: "paid",
                  paystackTransactionId:
                    data.id || null,
                  paidAt: new Date(),
                  updatedAt: new Date(),
                },
              },
              {
                upsert: true,
              }
            );

          console.log(
            "✅ Partner subscription activated:",
            partnerPayment.partnerId.toString()
          );

          break;
        }

        /* =====================================================
        NORMAL ASK MICHAEL USER PAYMENT
        ===================================================== */

        const userId = metadata.userId;
        const plan = metadata.plan;

        if (!userId || !plan) {
          console.warn(
            "⚠️ Missing user payment metadata — skipping upgrade"
          );

          break;
        }

        let tier:
          | "free"
          | "pro"
          | "pro_plus" = "free";

        if (plan === "pro") {
          tier = "pro";
        }

        if (plan === "pro_plus") {
          tier = "pro_plus";
        }

        /* ==========================================
        UPDATE NORMAL USER
        ========================================== */

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

        /* ==========================================
        STORE NORMAL USER TRANSACTION
        ========================================== */

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
          {
            upsert: true,
          }
        );

        break;
      }

            case "subscription.create":
      case "subscription.enable": {
        const data = event.data;
        const metadata = data.metadata || {};

        /* =====================================================
        PARTNER SUBSCRIPTION
        ===================================================== */

        const partnerId = metadata.partnerId;
        const paymentType = metadata.paymentType;

        if (
          partnerId &&
          paymentType === "partner_subscription"
        ) {
          console.log(
            "✅ Partner subscription created/enabled:",
            partnerId
          );

          if (!ObjectId.isValid(partnerId)) {
            console.warn(
              "⚠️ Invalid partner ID:",
              partnerId
            );

            break;
          }

          const partner = await db
            .collection("partners")
            .findOne({
              _id: new ObjectId(partnerId),
            });

          if (!partner) {
            console.warn(
              "⚠️ Partner not found:",
              partnerId
            );

            break;
          }

          /* ==========================================
          CALCULATE NEXT BILLING DATE
          ========================================== */

          const nextBillingDate =
            new Date();

          nextBillingDate.setMonth(
            nextBillingDate.getMonth() + 1
          );

          /* ==========================================
          UPDATE PARTNER SUBSCRIPTION
          ========================================== */

          await db
            .collection("partners")
            .updateOne(
              {
                _id: new ObjectId(partnerId),
              },
              {
                $set: {
                  subscriptionStatus:
                    "active",

                  paymentStatus:
                    "paid",

                  paystackCustomerCode:
                    data.customer_code ||
                    partner.paystackCustomerCode ||
                    null,

                  paystackSubscriptionCode:
                    data.subscription_code ||
                    partner.paystackSubscriptionCode ||
                    null,

                  paystackEmailToken:
                    data.email_token ||
                    partner.paystackEmailToken ||
                    null,

                  lastPaymentAt:
                    new Date(),

                  nextBillingDate,

                  updatedAt:
                    new Date(),
                },
              }
            );

          console.log(
            "✅ Partner subscription activated:",
            partnerId
          );

          break;
        }

        /* =====================================================
        NORMAL ASK MICHAEL USER SUBSCRIPTION
        ===================================================== */

        const userId =
          metadata.userId;

        const plan =
          metadata.plan;

        if (!userId || !plan) {
          console.warn(
            "⚠️ Missing user subscription metadata — skipping"
          );

          break;
        }

        let tier:
          | "free"
          | "pro"
          | "pro_plus" = "free";

        if (plan === "pro") {
          tier = "pro";
        }

        if (plan === "pro_plus") {
          tier = "pro_plus";
        }

        await db
          .collection("users")
          .updateOne(
            { userId },
            {
              $set: {
                tier,

                subscriptionStatus:
                  "active",

                updatedAt:
                  new Date(),
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
import { NextResponse } from "next/server";
import axios from "axios";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    // ==========================================
    // GET PARTNER TOKEN
    // ==========================================

    const token =
      req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json(
        {
          error: "Missing partner token",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // VALIDATE PARTNER TOKEN
    // ==========================================

    if (!ObjectId.isValid(token)) {
      return NextResponse.json(
        {
          error: "Invalid partner token",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // GET PAYMENT REFERENCE
    // ==========================================

    const body = await req.json();

    const reference =
      body.reference;

    if (!reference) {
      return NextResponse.json(
        {
          error:
            "Payment reference is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CONNECT TO DATABASE
    // ==========================================

    const { db } =
      await connectToDatabase();

    // ==========================================
    // FIND PARTNER
    // ==========================================

    const partner =
      await db
        .collection("partners")
        .findOne({
          _id: new ObjectId(token),
        });

    if (!partner) {
      return NextResponse.json(
        {
          error: "Partner not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // FIND PENDING PAYMENT
    // ==========================================

    const payment =
      await db
        .collection("partner_payments")
        .findOne({
          partnerId:
            partner._id,

          reference,
        });

    if (!payment) {
      return NextResponse.json(
        {
          error:
            "Payment record not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // PREVENT DUPLICATE PROCESSING
    // ==========================================

    if (
      payment.status ===
      "success"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Payment has already been verified.",
      });
    }

    // ==========================================
    // VERIFY DIRECTLY WITH PAYSTACK
    // ==========================================

    const paystackResponse =
      await axios.get(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

    const paystackData =
      paystackResponse.data?.data;

    if (!paystackData) {
      return NextResponse.json(
        {
          error:
            "Paystack returned no transaction data.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK PAYMENT STATUS
    // ==========================================

    if (
      paystackData.status !==
      "success"
    ) {
      await db
        .collection(
          "partner_payments"
        )
        .updateOne(
          {
            _id: payment._id,
          },
          {
            $set: {
              status:
                paystackData.status ||
                "failed",

              paystackStatus:
                paystackData.status ||
                null,

              updatedAt:
                new Date(),
            },
          }
        );

      return NextResponse.json(
        {
          error:
            "Payment was not successful.",
          status:
            paystackData.status ||
            "unknown",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VERIFY PARTNER ID FROM PAYSTACK METADATA
    // ==========================================

    const metadata =
      paystackData.metadata;

    const metadataPartnerId =
      metadata?.partnerId;

    if (
      metadataPartnerId !==
      partner._id.toString()
    ) {
      return NextResponse.json(
        {
          error:
            "Payment does not belong to this partner.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // VERIFY PAYMENT TYPE
    // ==========================================

    if (
      metadata?.paymentType !==
      "partner_subscription"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid partner payment type.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // UPDATE PAYMENT RECORD
    // ==========================================

    await db
      .collection(
        "partner_payments"
      )
      .updateOne(
        {
          _id: payment._id,
        },
        {
          $set: {
            status:
              "success",

            paystackStatus:
              paystackData.status,

            paystackTransactionId:
              paystackData.id,

            paystackReference:
              paystackData.reference,

            gatewayResponse:
              paystackData.gateway_response ||
              null,

            paidAt:
              paystackData.paid_at
                ? new Date(
                    paystackData.paid_at
                  )
                : new Date(),

            channel:
              paystackData.channel ||
              null,

            customerCode:
              paystackData.customer?.customer_code ||
              null,

            authorizationCode:
              paystackData.authorization?.authorization_code ||
              null,

            subscriptionCode:
              paystackData.subscription?.subscription_code ||
              null,

            updatedAt:
              new Date(),
          },
        }
      );

    // ==========================================
    // CALCULATE NEXT BILLING DATE
    // ==========================================

    const paidAt =
      paystackData.paid_at
        ? new Date(
            paystackData.paid_at
          )
        : new Date();

    const nextBillingDate =
      new Date(paidAt);

    nextBillingDate.setMonth(
      nextBillingDate.getMonth() + 1
    );

    // ==========================================
    // UPDATE PARTNER ACCOUNT
    // ==========================================

    await db
      .collection("partners")
      .updateOne(
        {
          _id: partner._id,
        },
        {
          $set: {
            subscriptionStatus:
              "active",

            paymentStatus:
              "paid",

            lastPaymentDate:
              paidAt,

            nextBillingDate,

            lastPaymentReference:
              reference,

            updatedAt:
              new Date(),
          },
        }
      );

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json({
      success: true,

      message:
        "Partner payment verified successfully.",

      reference,

      subscriptionStatus:
        "active",

      nextBillingDate,
    });

  } catch (error: unknown) {
    console.error(
      "PARTNER PAYSTACK VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify partner payment.",
      },
      {
        status: 500,
      }
    );
  }
}
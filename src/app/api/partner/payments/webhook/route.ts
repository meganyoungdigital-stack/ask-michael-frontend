import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    // ==========================================
    // GET RAW REQUEST BODY
    // ==========================================

    const rawBody = await req.text();

    // ==========================================
    // GET PAYSTACK SIGNATURE
    // ==========================================

    const signature =
      req.headers.get(
        "x-paystack-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          error:
            "Missing Paystack signature.",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // VERIFY PAYSTACK SIGNATURE
    // ==========================================

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYSTACK_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Payment configuration error.",
        },
        {
          status: 500,
        }
      );
    }

    const expectedSignature =
      crypto
        .createHmac(
          "sha512",
          secretKey
        )
        .update(rawBody)
        .digest("hex");

    if (
      signature !==
      expectedSignature
    ) {
      console.error(
        "Invalid Paystack webhook signature."
      );

      return NextResponse.json(
        {
          error:
            "Invalid webhook signature.",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // PARSE PAYSTACK EVENT
    // ==========================================

    const event =
      JSON.parse(rawBody);

    console.log(
      "Paystack webhook received:",
      event.event
    );

    // ==========================================
    // ONLY PROCESS SUCCESSFUL CHARGES
    // ==========================================

    if (
      event.event !==
      "charge.success"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Webhook event received.",
      });
    }

    // ==========================================
    // GET TRANSACTION DATA
    // ==========================================

    const transaction =
      event.data;

    if (!transaction) {
      return NextResponse.json(
        {
          error:
            "Webhook transaction data is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const reference =
      transaction.reference;

    if (!reference) {
      return NextResponse.json(
        {
          error:
            "Payment reference is missing.",
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
    // FIND PAYMENT RECORD
    // ==========================================

    const payment =
      await db
        .collection(
          "partner_payments"
        )
        .findOne({
          reference,
        });

    if (!payment) {
      console.error(
        "Partner payment not found:",
        reference
      );

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
      "paid"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Payment has already been processed.",
      });
    }

    // ==========================================
    // CHECK PAYSTACK STATUS
    // ==========================================

    if (
      transaction.status !==
      "success"
    ) {
      return NextResponse.json(
        {
          error:
            "Transaction was not successful.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CHECK PAYMENT AMOUNT
    // ==========================================

    const expectedAmount =
      Number(payment.amount);

    const paidAmount =
      Number(transaction.amount);

    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount <= 0
    ) {
      console.error(
        "Invalid expected payment amount:",
        {
          reference,
          expectedAmount,
        }
      );

      return NextResponse.json(
        {
          error:
            "Payment record does not contain a valid expected amount.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        paidAmount
      ) ||
      paidAmount !==
        expectedAmount
    ) {
      console.error(
        "PAYSTACK WEBHOOK AMOUNT MISMATCH:",
        {
          reference,
          expectedAmount,
          paidAmount,
        }
      );

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
                "failed",

              paystackStatus:
                transaction.status,

              updatedAt:
                new Date(),
            },
          }
        );

      return NextResponse.json(
        {
          error:
            "Payment amount does not match the expected amount.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // VERIFY PARTNER METADATA
    // ==========================================

    const metadata =
      transaction.metadata;

    const metadataPartnerId =
      metadata?.partnerId;

    if (
      metadataPartnerId !==
      payment.partnerId.toString()
    ) {
      console.error(
        "Webhook partner ID mismatch:",
        {
          reference,
          metadataPartnerId,
          paymentPartnerId:
            payment.partnerId.toString(),
        }
      );

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
    // GET PAID DATE
    // ==========================================

    const paidAt =
      transaction.paid_at
        ? new Date(
            transaction.paid_at
          )
        : new Date();

    // ==========================================
    // CALCULATE NEXT BILLING DATE
    // ==========================================

    const nextBillingDate =
      new Date(paidAt);

    nextBillingDate.setMonth(
      nextBillingDate.getMonth() + 1
    );

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
              "paid",

            paystackStatus:
              transaction.status,

            paystackTransactionId:
              transaction.id,

            paystackReference:
              transaction.reference,

            gatewayResponse:
              transaction.gateway_response ||
              null,

            paidAt,

            channel:
              transaction.channel ||
              null,

            customerCode:
              transaction.customer?.customer_code ||
              null,

            authorizationCode:
              transaction.authorization?.authorization_code ||
              null,

            subscriptionCode:
              transaction.subscription?.subscription_code ||
              null,

            updatedAt:
              new Date(),
          },
        }
      );

    // ==========================================
    // UPDATE PARTNER ACCOUNT
    // ==========================================

    await db
      .collection("partners")
      .updateOne(
        {
          _id:
            payment.partnerId,
        },
        {
          $set: {
            subscriptionStatus:
              "active",

            paymentStatus:
              "paid",

            lastPaymentAt:
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

    console.log(
      "Partner subscription activated:",
      reference
    );

    return NextResponse.json({
      success: true,
      message:
        "Partner payment processed successfully.",
      reference,
    });

  } catch (error) {
    console.error(
      "PARTNER PAYSTACK WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process Paystack webhook.",
      },
      {
        status: 500,
      }
    );
  }
}
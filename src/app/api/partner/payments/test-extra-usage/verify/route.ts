import { NextResponse } from "next/server";
import axios from "axios";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";

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
          error: "Missing partner token.",
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
          error: "Invalid partner token.",
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

const initializationReference =
  body.initializationReference;

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

if (!initializationReference) {
  return NextResponse.json(
    {
      error:
        "Initialization payment reference is required.",
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
    // FIND PAYMENT RECORD
    // ==========================================

    const payment =
  await db
    .collection("partner_payments")
    .findOne({
      partnerId:
        partner._id,

      reference:
        initializationReference,

      paymentType:
        "partner_extra_usage_test",
    });
    if (!payment) {
      return NextResponse.json(
        {
          error:
            "Extra-usage payment record not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // MAKE SURE THIS IS AN EXTRA-USAGE PAYMENT
    // ==========================================

    if (
      payment.paymentType !==
      "partner_extra_usage_test"
    ) {
      return NextResponse.json(
        {
          error:
            "This is not an extra-usage test payment.",
        },
        {
          status: 400,
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

        alreadyProcessed:
          true,

        message:
          "Extra-usage test payment has already been verified.",

        reference,

        billedExtraMessages:
          partner.billedExtraMessages ?? 0,
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
            _id:
              payment._id,
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
            "Extra-usage payment was not successful.",

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
    // CHECK PAYMENT AMOUNT
    // ==========================================

    const expectedAmount =
      Number(payment.amount);

    const paidAmount =
      Number(paystackData.amount);

    if (
      !Number.isFinite(
        expectedAmount
      ) ||
      expectedAmount <= 0
    ) {
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
        "PAYSTACK EXTRA-USAGE AMOUNT MISMATCH:",
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
            _id:
              payment._id,
          },
          {
            $set: {
              status:
                "failed",

              paystackStatus:
                paystackData.status,

              updatedAt:
                new Date(),
            },
          }
        );

      return NextResponse.json(
        {
          error:
            "Extra-usage payment amount does not match the expected amount.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
// GET PAYSTACK METADATA
// ==========================================

const metadata =
  paystackData.metadata;

// ==========================================
// VERIFY PAYMENT TYPE
// ==========================================

if (
  metadata?.paymentType !==
  "partner_extra_usage_test"
) {
      return NextResponse.json(
        {
          error:
            "Invalid extra-usage payment type.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // GET EXTRA MESSAGES FROM PAYMENT
    // ==========================================

    const paidExtraMessages =
      Math.max(
        0,
        Number(
          payment.extraMessages ??
            metadata?.extraMessages ??
            0
        )
      );

    if (
      !Number.isFinite(
        paidExtraMessages
      ) ||
      paidExtraMessages <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Payment does not contain a valid extra-message amount.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CALCULATE NEW BILLED EXTRA MESSAGES
    // ==========================================

    const currentBilledExtraMessages =
      Math.max(
        0,
        Number(
          partner.billedExtraMessages ??
            0
        )
      );

    const newBilledExtraMessages =
      currentBilledExtraMessages +
      paidExtraMessages;

    // ==========================================
    // UPDATE PAYMENT RECORD
    // ==========================================

    const paidAt =
      paystackData.paid_at
        ? new Date(
            paystackData.paid_at
          )
        : new Date();

    const paymentUpdateResult =
  await db
    .collection("partner_payments")
    .updateOne(
      {
        _id: payment._id,
      },
      {
        $set: {
          status: "paid",

          paystackStatus:
            paystackData.status,

          paystackTransactionId:
            paystackData.id,

          paystackReference:
            paystackData.reference,

          gatewayResponse:
            paystackData.gateway_response ||
            null,

          paidAt,

          channel:
            paystackData.channel ||
            null,

          customerCode:
            paystackData.customer?.customer_code ||
            null,

          authorizationCode:
            paystackData.authorization
              ?.authorization_code ||
            null,

          extraMessages:
            paidExtraMessages,

          updatedAt:
            new Date(),
        },
      }
    );

console.log(
  "PAYSTACK EXTRA-USAGE PAYMENT UPDATE RESULT:",
  {
    matchedCount:
      paymentUpdateResult.matchedCount,

    modifiedCount:
      paymentUpdateResult.modifiedCount,

    paymentId:
      payment._id.toString(),

    initializationReference:
      payment.reference,

    paystackReference:
      paystackData.reference,
  }
);

    // ==========================================
    // UPDATE PARTNER BILLING
    // ==========================================

    await db
      .collection("partners")
      .updateOne(
        {
          _id:
            partner._id,
        },
        {
          $set: {
            billedExtraMessages:
              newBilledExtraMessages,

            updatedAt:
              new Date(),
          },
        }
      );

    // ==========================================
    // CALCULATE UPDATED BILLING
    // ==========================================

    const updatedBilling =
      calculatePartnerBilling({
        messages:
          partner.messages,

        includedMessages:
          partner.includedMessages,

        billedExtraMessages:
          newBilledExtraMessages,

        pricePerMessage:
          partner.pricePerMessage,

        monthlyFee:
          partner.monthlyFee,
      });

    // ==========================================
    // SUCCESS
    // ==========================================

    return NextResponse.json({
      success: true,

      test: true,

      message:
        "Extra-usage test payment verified and billing updated successfully.",

      reference,

      paidAmount,

      paidExtraMessages,

      billedExtraMessages:
        newBilledExtraMessages,

      billing:
        updatedBilling,
    });

  } catch (error: unknown) {
    console.error(
      "PAYSTACK EXTRA-USAGE VERIFICATION ERROR:",
      error
    );

    if (
      axios.isAxiosError(error)
    ) {
      console.error(
        "PAYSTACK EXTRA-USAGE VERIFY STATUS:",
        error.response?.status
      );

      console.error(
        "PAYSTACK EXTRA-USAGE VERIFY RESPONSE:",
        JSON.stringify(
          error.response?.data ??
            null,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify extra-usage payment.",

          paystackStatus:
            error.response?.status ??
            null,

          paystackResponse:
            error.response?.data ??
            null,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown verification error.",
      },
      {
        status: 500,
      }
    );
  }
}
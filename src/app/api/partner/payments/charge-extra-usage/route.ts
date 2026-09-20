import { NextResponse } from "next/server";
import axios from "axios";

import { connectToDatabase } from "@/lib/mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";
import { hashPartnerApiKey } from "@/lib/partnerApiKeys";
import { partnerPaymentRatelimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
       // ==========================================
    // GET PARTNER API KEY
    //
    // Partner API requests authenticate using
    // the API key supplied in the Authorization header.
    // ==========================================

const authorization =
  req.headers.get("Authorization");

if (!authorization) {
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
// REMOVE BEARER PREFIX
// ==========================================

const partnerToken =
  authorization.startsWith("Bearer ")
    ? authorization.substring(7)
    : authorization;
const apiKeyHash =
  hashPartnerApiKey(partnerToken);

  const rateLimitResult =
  await partnerPaymentRatelimit.limit(
    apiKeyHash
  );

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error:
        "Too many payment attempts. Please try again later.",
    },
    {
      status: 429,
    }
  );
}


// ==========================================
// SELECT TEST OR LIVE MODE
// ==========================================

const isPreview =
  process.env.VERCEL_ENV === "preview";

  // ==========================================
// PAYSTACK SAFETY CHECK
// ==========================================

const paystackSecretKey =
  process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecretKey) {
  return NextResponse.json(
    {
      error:
        "Paystack secret key is not configured.",
    },
    {
      status: 500,
    }
  );
}

if (
  isPreview &&
  !paystackSecretKey.startsWith("sk_test_")
) {
  return NextResponse.json(
    {
      error:
        "Preview extra-usage charging requires a Paystack TEST secret key.",
    },
    {
      status: 403,
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
    .findOne(
      isPreview
        ? {
            testApiKeyHash:
              apiKeyHash,
          }
        : {
            apiKeyHash:
              apiKeyHash,
          }
    );
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
    // CHECK PARTNER STATUS
    // ==========================================

    if (
      partner.status !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Partner account is not active.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // CHECK SUBSCRIPTION STATUS
    // ==========================================

    if (
      partner.subscriptionStatus !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Partner subscription is not active.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // GET PAYSTACK AUTHORIZATION
    // ==========================================

    const authorizationCode =
      partner.paystackAuthorizationCode;

    if (!authorizationCode) {
      return NextResponse.json(
        {
          error:
            "No reusable Paystack authorization is available for this partner.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CALCULATE CURRENT BILLING
    // ==========================================

    const billing =
  calculatePartnerBilling({
    messages:
      partner.messages,

    includedMessages:
      partner.includedMessages,

    billedExtraMessages:
      partner.billedExtraMessages,

    pricePerMessage:
      partner.pricePerMessage,

    monthlyFee:
      partner.monthlyFee,
  });

  
    // ==========================================
    // CHECK FOR EXTRA USAGE
    // ==========================================

    if (
      billing.extraMessages <= 0
    ) {
      return NextResponse.json({
        success: true,

        message:
          "No extra message usage to charge.",

        extraMessages: 0,

        extraUsageCharge: 0,
      });
    }

    // ==========================================
    // CALCULATE EXTRA USAGE AMOUNT
    // ==========================================

    const extraUsageCharge =
      billing.extraUsageCharge;

    if (
      !Number.isFinite(
        extraUsageCharge
      ) ||
      extraUsageCharge <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Extra usage charge is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // PAYSTACK AMOUNT
    //
    // Paystack expects the amount in kobo/cents.
    // ZAR uses cents.
    // ==========================================

    const amount =
      Math.round(
        extraUsageCharge * 100
      );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Calculated Paystack amount is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CREATE UNIQUE REFERENCE
    // ==========================================

    // ==========================================
// CREATE BILLING ALLOCATION KEY
// ==========================================
//
// This identifies the exact extra-usage allocation
// currently being charged for this partner.
// The billed counter determines the starting point,
// while the calculated extraMessages determines the
// size of this allocation.
// ==========================================

const billingAllocationKey =
  `${partner._id.toString()}_${billing.billedExtraMessages}_${billing.extraMessages}`;

// ==========================================
// CREATE UNIQUE REFERENCE
// ==========================================

const reference =
  `partner_extra_${partner._id.toString()}_${Date.now()}`;

// ==========================================
// CREATE EXTRA-USAGE PAYMENT RECORD
// ==========================================

      let paymentResult;

    try {
      paymentResult =
        await db
          .collection(
            "partner_payments"
          )
          .insertOne({
            partnerId:
              partner._id,

            reference,

            amount,

            currency:
              "ZAR",

            plan:
              partner.plan ||
              null,

            monthlyFee:
              partner.monthlyFee ??
              null,

            paymentType:
              "partner_extra_usage",

            billingAllocationKey,

            extraMessages:
              billing.extraMessages,

            extraUsageCharge,

            status:
              "pending",

            createdAt:
              new Date(),

            updatedAt:
              new Date(),
          });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        return NextResponse.json({
          success: true,

          message:
            "This extra-usage allocation has already been claimed.",

          extraMessages:
            billing.extraMessages,

          extraUsageCharge,

          alreadyClaimed: true,
        });
      }

      throw error;
    }

    // ==========================================
    // CHARGE PAYSTACK AUTHORIZATION
    // ==========================================

    console.log(
      "PAYSTACK EXTRA USAGE CHARGE:",
      {
        partnerId:
          partner._id.toString(),

        reference,

        extraMessages:
          billing.extraMessages,

        extraUsageCharge,

        amount,

        authorizationCode:
          "PRESENT",
      }
    );

    const paystackResponse =
      await axios.post(
        "https://api.paystack.co/transaction/charge_authorization",
        {
          authorization_code:
            authorizationCode,

          email:
            partner.email,

          amount:
            amount.toString(),

          currency:
            "ZAR",

          reference,

          metadata: {
            partnerId:
              partner._id.toString(),

                      paymentType:
            "partner_extra_usage",

          billingAllocationKey,

          extraMessages:
            billing.extraMessages,

          extraUsageCharge,

            paymentRecordId:
              paymentResult.insertedId.toString(),
          },
        },
        {
          headers: {
            Authorization:
  `Bearer ${paystackSecretKey}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    // ==========================================
    // PAYSTACK RESPONSE
    // ==========================================

    console.log(
      "PAYSTACK EXTRA USAGE RESPONSE:",
      JSON.stringify(
        paystackResponse.data,
        null,
        2
      )
    );

    const paystackData =
      paystackResponse.data?.data;

    // ==========================================
    // CHECK PAYSTACK RESULT
    // ==========================================

    if (
      !paystackResponse.data?.status ||
      !paystackData
    ) {
      await db
        .collection(
          "partner_payments"
        )
        .updateOne(
          {
            _id:
              paymentResult.insertedId,
          },
          {
            $set: {
              status:
                "failed",

              paystackStatus:
                paystackData?.status ||
                null,

              updatedAt:
                new Date(),
            },
          }
        );

      return NextResponse.json(
        {
          error:
            "Paystack failed to charge the extra usage.",
          paystackResponse:
            paystackResponse.data,
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // SUCCESSFUL EXTRA-USAGE CHARGE
    // ==========================================

    if (
      paystackData.status ===
      "success"
    ) {

// ==========================================
// MARK EXTRA MESSAGES AS BILLED
// ==========================================

const billedUsageResult =
  await db
    .collection("partners")
    .updateOne(
      {
        _id: partner._id,
        billedExtraMessages:
          billing.billedExtraMessages,
      },
      {
        $inc: {
          billedExtraMessages:
            billing.extraMessages,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

if (
  billedUsageResult.modifiedCount !==
  1
) {
  console.error(
    "EXTRA USAGE BILLING COUNTER UPDATE FAILED:",
    {
      partnerId:
        partner._id.toString(),

      billingAllocationKey,

      expectedBilledExtraMessages:
        billing.billedExtraMessages,

      extraMessages:
        billing.extraMessages,
    }
  );

  return NextResponse.json(
    {
      error:
        "Extra usage was charged, but the billing counter could not be updated safely.",
    },
    {
      status: 500,
    }
  );
}
      await db
        .collection(
          "partner_payments"
        )
        .updateOne(
          {
            _id:
              paymentResult.insertedId,
          },
          {
            $set: {
              status:
                "paid",

              paystackStatus:
                paystackData.status,

              paystackTransactionId:
                paystackData.id ||
                null,

              paystackReference:
                paystackData.reference ||
                reference,

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
                authorizationCode,

              updatedAt:
                new Date(),
            },
          }
        );

      return NextResponse.json({
        success: true,

        message:
          "Extra usage charged successfully.",

        reference,

        extraMessages:
          billing.extraMessages,

        extraUsageCharge,

        amount,

        currency:
          "ZAR",
      });
    }

    // ==========================================
    // CHARGE NOT IMMEDIATELY SUCCESSFUL
    // ==========================================

    await db
      .collection(
        "partner_payments"
      )
      .updateOne(
        {
          _id:
            paymentResult.insertedId,
        },
        {
          $set: {
            status:
              "pending",

            paystackStatus:
              paystackData.status ||
              null,

            updatedAt:
              new Date(),
          },
        }
      );

    return NextResponse.json({
      success: false,

      message:
        "Paystack received the extra usage charge but it is not yet marked as successful.",

      reference,

      paystackStatus:
        paystackData.status ||
        null,
    });

  } catch (error: unknown) {
       if (axios.isAxiosError(error)) {
      console.error(
        "PARTNER EXTRA USAGE CHARGE FAILED:",
        {
          paystackStatus:
            error.response?.status ?? null,
        }
      );

      return NextResponse.json(
        {
          error:
            "Unable to charge partner for extra usage.",
        },
        {
          status: 500,
        }
      );
    }

        console.error(
      "PARTNER EXTRA USAGE CHARGE FAILED"
    );


    return NextResponse.json(
      {
        error:
          "Unable to charge partner for extra usage.",
      },
      {
        status: 500,
      }
    );
  }
}
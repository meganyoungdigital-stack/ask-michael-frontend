import { NextResponse } from "next/server";
import axios from "axios";

import { connectToDatabase } from "@/lib/mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";

export async function POST(req: Request) {
  try {
    // ==========================================
// GET PARTNER TOKEN
//
// The existing partner login system stores
// partner._id in localStorage as partnerToken.
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

// ==========================================
// VALIDATE MONGODB PARTNER ID
// ==========================================

if (
  !/^[a-fA-F0-9]{24}$/.test(
    partnerToken
  )
) {
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
// SELECT TEST OR LIVE MODE
// ==========================================

const isPreview =
  process.env.VERCEL_ENV === "preview";

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
            testApiKey:
              partnerToken,
          }
        : {
            apiKey:
              partnerToken,
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

    const reference =
      `partner_extra_${partner._id.toString()}_${Date.now()}`;

    // ==========================================
    // CREATE EXTRA-USAGE PAYMENT RECORD
    // ==========================================

    const paymentResult =
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
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

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

await db
  .collection("partners")
  .updateOne(
    {
      _id: partner._id,
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
    console.error(
      "PARTNER EXTRA USAGE CHARGE ERROR:",
      error
    );

    if (
      axios.isAxiosError(error)
    ) {
      console.error(
        "PAYSTACK STATUS:",
        error.response?.status
      );

      console.error(
        "PAYSTACK RESPONSE:",
        JSON.stringify(
          error.response?.data,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Unable to charge partner for extra usage.",

          details:
            error.message,

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
          "Unable to charge partner for extra usage.",
      },
      {
        status: 500,
      }
    );
  }
}
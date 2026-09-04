import { NextResponse } from "next/server";
import axios from "axios";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";

export async function POST(req: Request) {
  try {
    // ==========================================
    // SAFETY CHECK
    //
    // This route is ONLY allowed when the
    // Paystack secret key is a TEST key.
    // ==========================================

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY || "";

    if (!secretKey.startsWith("sk_test_")) {
      return NextResponse.json(
        {
          error:
            "TEST ROUTE BLOCKED: PAYSTACK_SECRET_KEY is not a test key.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // GET PARTNER ID
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

const partnerId =
  authorization.startsWith("Bearer ")
    ? authorization.substring(7)
    : authorization;

if (!ObjectId.isValid(partnerId)) {
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
          _id: new ObjectId(partnerId),
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
    // CALCULATE EXTRA USAGE
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
    // NO EXTRA USAGE
    // ==========================================

    if (billing.extraMessages <= 0) {
      return NextResponse.json({
        success: true,

        test: true,

        message:
          "Partner has no extra usage to charge.",

        billing,
      });
    }

    // ==========================================
    // CALCULATE PAYSTACK AMOUNT
    // ==========================================

    const extraUsageCharge =
      Number(billing.extraUsageCharge);

    if (
      !Number.isFinite(extraUsageCharge) ||
      extraUsageCharge <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Calculated extra usage charge is invalid.",

          billing,
        },
        {
          status: 400,
        }
      );
    }

    const amount =
      Math.round(
        extraUsageCharge * 100
      );

    // ==========================================
    // CREATE TEST REFERENCE
    // ==========================================

    const reference =
      `test_extra_${partner._id.toString()}_${Date.now()}`;

    // ==========================================
    // LOG TEST INFORMATION
    // ==========================================

    console.log(
      "PAYSTACK EXTRA USAGE TEST:",
      {
        partnerId:
          partner._id.toString(),

        reference,

        messages:
          partner.messages,

        includedMessages:
          partner.includedMessages,

        billedExtraMessages:
          partner.billedExtraMessages,

        extraMessages:
          billing.extraMessages,

        extraUsageCharge,

        amount,

        currency: "ZAR",

        paystackEnvironment:
          "TEST",
      }
    );

    // ==========================================
    // IMPORTANT:
    //
    // THIS ROUTE DOES NOT USE
    // charge_authorization.
    //
    // It creates a Paystack TEST transaction
    // that can be opened in the Paystack
    // checkout window.
    // ==========================================

    // ==========================================
    // CREATE PENDING PAYMENT RECORD
    //
    // IMPORTANT:
    // Save the initialization reference in
    // MongoDB before opening Paystack.
    //
    // The verification route uses this record
    // to identify the extra-usage payment.
    // ==========================================

    await db
      .collection("partner_payments")
      .insertOne({
        partnerId:
          partner._id,

        reference,

        paymentType:
          "partner_extra_usage_test",

        status:
          "pending",

        amount,

        currency:
          "ZAR",

        extraMessages:
          billing.extraMessages,

        extraUsageCharge,

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      });

    // ==========================================
    // IMPORTANT:
    //
    // THIS ROUTE DOES NOT USE
    // charge_authorization.
    //
    // It creates a Paystack TEST transaction
    // that can be opened in the Paystack
    // checkout window.
    // ==========================================

    const paystackResponse =
      await axios.post(

        "https://api.paystack.co/transaction/initialize",
        {
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
              "partner_extra_usage_test",

            extraMessages:
              billing.extraMessages,

            extraUsageCharge,
          },
        },
        {
          headers: {
            Authorization:
              `Bearer ${secretKey}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    // ==========================================
    // PAYSTACK RESPONSE
    // ==========================================

    console.log(
      "PAYSTACK EXTRA USAGE TEST RESPONSE:",
      JSON.stringify(
        paystackResponse.data,
        null,
        2
      )
    );

    const paystackData =
      paystackResponse.data?.data;

    if (
      !paystackResponse.data?.status ||
      !paystackData?.access_code
    ) {
      return NextResponse.json(
        {
          error:
            "Paystack test transaction could not be initialized.",

          paystackResponse:
            paystackResponse.data,
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // RETURN TEST RESULT
    //
    // NOTHING HAS BEEN CHARGED.
    // NOTHING HAS BEEN MARKED AS BILLED.
    // ==========================================

    return NextResponse.json({
      success: true,

      test: true,

      message:
        "Paystack TEST transaction initialized successfully. No live charge was made.",

      reference,

      accessCode:
        paystackData.access_code,

      authorizationUrl:
        paystackData.authorization_url,

      amount,

      currency:
        "ZAR",

      extraMessages:
        billing.extraMessages,

      extraUsageCharge,

      partnerId:
        partner._id.toString(),

      warning:
        "This test route does not update billedExtraMessages and does not use charge_authorization.",
    });

  } catch (error: unknown) {
    console.error(
      "PAYSTACK EXTRA USAGE TEST ERROR:",
      error
    );

    if (axios.isAxiosError(error)) {
      console.error(
        "PAYSTACK TEST STATUS:",
        error.response?.status
      );

      console.error(
        "PAYSTACK TEST RESPONSE:",
        JSON.stringify(
          error.response?.data ?? null,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            "Paystack TEST request failed.",

          paystackStatus:
            error.response?.status ?? null,

          paystackResponse:
            error.response?.data ?? null,
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
            : "Unknown test error.",
      },
      {
        status: 500,
      }
    );
  }
}
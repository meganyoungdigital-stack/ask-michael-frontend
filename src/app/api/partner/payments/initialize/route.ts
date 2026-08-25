import { NextResponse } from "next/server";
import axios from "axios";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import { PARTNER_PLANS } from "@/lib/partnerPlans";

export async function POST(req: Request) {
  try {
    // ==========================================
    // GET PARTNER TOKEN
    // ==========================================

    const token = req.headers.get("Authorization");

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
    // CONNECT TO DATABASE
    // ==========================================

    const { db } = await connectToDatabase();

    // ==========================================
    // FIND PARTNER
    // ==========================================

    const partner = await db
      .collection("partners")
      .findOne({
        _id: new ObjectId(token),
      });

    if (!partner) {
      return NextResponse.json(
        {
          error: "Partner not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // CHECK PARTNER STATUS
    // ==========================================

    if (partner.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Your partner account is not active and cannot make a payment.",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // VALIDATE EMAIL
    // ==========================================

    const email = partner.email;

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Partner email address is missing.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // DETERMINE PARTNER PLAN
    // ==========================================

    const plan =
      partner.plan as
        | "starter"
        | "business"
        | "enterprise"
        | undefined;

    if (!plan || !PARTNER_PLANS[plan]) {
      return NextResponse.json(
        {
          error:
            "Partner plan is not configured.",
        },
        {
          status: 400,
        }
      );
    }

    const planConfig =
      PARTNER_PLANS[plan];

    // ==========================================
    // CURRENCY
    //
    // Paystack account is configured for ZAR.
    // Starter and Business use their Paystack
    // recurring plans.
    //
    // Enterprise uses the partner's custom
    // monthly fee.
    // ==========================================

    const currency = "ZAR";

    // ==========================================
    // CREATE UNIQUE PAYMENT REFERENCE
    // ==========================================

    const reference =
      `partner_${partner._id.toString()}_${Date.now()}`;

    // ==========================================
    // PAYSTACK REQUEST
    // ==========================================

    const paystackPayload: {
      email: string;
      currency: string;
      reference: string;
      plan?: string;
      amount?: string;
      metadata: Record<string, unknown>;
    } = {
      email,

      currency,

      reference,

      metadata: {
        partnerId:
          partner._id.toString(),

        plan,

        paymentType:
          "partner_subscription",

        partnerMonthlyFee:
          partner.monthlyFee ?? null,

        partnerCurrency:
          partner.currency ?? null,
      },
    };

    // ==========================================
    // STARTER / BUSINESS
    //
    // Paystack plan controls the recurring
    // amount.
    // ==========================================

    if (
      plan !== "enterprise"
    ) {
      if (!planConfig.paystackPlanCode) {
        return NextResponse.json(
          {
            error:
              "Paystack plan code is not configured.",
          },
          {
            status: 500,
          }
        );
      }

      paystackPayload.plan =
        planConfig.paystackPlanCode;
    }

    // ==========================================
    // ENTERPRISE
    //
    // Enterprise has no predefined Paystack
    // plan, so use the custom partner amount.
    // ==========================================

    if (
      plan === "enterprise"
    ) {
      const monthlyFee =
        Number(partner.monthlyFee);

      if (
        !Number.isFinite(
          monthlyFee
        ) ||
        monthlyFee <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "Enterprise partner does not have a valid monthly fee.",
          },
          {
            status: 400,
          }
        );
      }

      const amount =
        Math.round(
          monthlyFee * 100
        );

      paystackPayload.amount =
        amount.toString();
    }

    // ==========================================
    // INITIALIZE WITH PAYSTACK
    // ==========================================

    const paystackResponse =
      await axios.post(
        "https://api.paystack.co/transaction/initialize",
        paystackPayload,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

            "Content-Type":
              "application/json",
          },
        }
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
            "Paystack failed to initialize the payment.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // DETERMINE PAYMENT AMOUNT FOR OUR RECORD
    // ==========================================

    let recordedAmount =
      partner.monthlyFee
        ? Math.round(
            Number(
              partner.monthlyFee
            ) * 100
          )
        : null;

    // ==========================================
    // SAVE PENDING PAYMENT
    // ==========================================

    await db
      .collection(
        "partner_payments"
      )
      .insertOne({
        partnerId:
          partner._id,

        reference,

        paystackAccessCode:
          paystackData.access_code,

        paystackPlanCode:
          planConfig.paystackPlanCode,

        amount:
          recordedAmount,

        currency,

        plan,

        monthlyFee:
          partner.monthlyFee ??
          null,

        paymentType:
          "partner_subscription",

        status:
          "pending",

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      });

    // ==========================================
    // RETURN CHECKOUT INFORMATION
    // ==========================================

    return NextResponse.json({
      success: true,

      accessCode:
        paystackData.access_code,

      reference,

      authorizationUrl:
        paystackData.authorization_url,

      plan,

      currency,
    });

  } catch (error: unknown) {
    console.error(
      "PAYSTACK PARTNER INITIALIZATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to initialize partner payment.",
      },
      {
        status: 500,
      }
    );
  }
}
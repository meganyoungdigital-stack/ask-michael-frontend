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

      const paystackPlanCode =
  plan === "starter"
    ? process.env.PAYSTACK_STARTER_PLAN_CODE
    : plan === "business"
      ? process.env.PAYSTACK_BUSINESS_PLAN
      : null;

      console.log(
  "PARTNER PAYSTACK PLAN DEBUG:",
  {
    plan,
    paystackPlanCode:
      planConfig?.paystackPlanCode,
    starterEnv:
  process.env.PAYSTACK_STARTER_PLAN_CODE
    ? "SET"
    : "MISSING",
    businessEnv:
      process.env.PAYSTACK_BUSINESS_PLAN
        ? "SET"
        : "MISSING",
  }
);

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

   if (plan !== "enterprise") {
  if (!paystackPlanCode) {
    return NextResponse.json(
      {
        error: "Paystack plan code is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  paystackPayload.plan = paystackPlanCode;
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
    // DEBUG PAYSTACK PLAN
    // ==========================================

    if (paystackPlanCode) {
      try {
        const planCheck =
          await axios.get(
            `https://api.paystack.co/plan/${paystackPlanCode}`,
            {
              headers: {
                Authorization:
                  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              },
            }
          );

        console.log(
          "PAYSTACK PLAN CHECK:",
          JSON.stringify(
            {
              success:
                planCheck.data?.status ?? false,

              message:
                planCheck.data?.message ?? null,

              planCode:
                planCheck.data?.data?.plan_code ?? null,

              domain:
                planCheck.data?.data?.domain ?? null,

              amount:
                planCheck.data?.data?.amount ?? null,

              currency:
                planCheck.data?.data?.currency ?? null,
            },
            null,
            2
          )
        );
      } catch (planError: unknown) {
        if (axios.isAxiosError(planError)) {
          console.error(
            "PAYSTACK PLAN CHECK FAILED:",
            JSON.stringify(
              planError.response?.data ?? null,
              null,
              2
            )
          );
        } else {
          console.error(
            "PAYSTACK PLAN CHECK FAILED:",
            planError
          );
        }
      }
    }

    // ==========================================
    // INITIALIZE WITH PAYSTACK
    // ==========================================

    console.log(
  "PAYSTACK INITIALIZE REQUEST:",
  JSON.stringify(
    {
      email,
      currency,
      reference,
      plan: paystackPayload.plan,
      amount: paystackPayload.amount,
    },
    null,
    2
  )
);

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

console.log(
  "PAYSTACK INITIALIZATION RESPONSE:",
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
        "Paystack failed to initialize the payment.",

      paystackResponse:
        paystackResponse.data,
    },
    {
      status: 500,
    }
  );
}

    // ==========================================
// DETERMINE PAYMENT AMOUNT FOR OUR RECORD
// ==========================================

let recordedAmount: number | null = null;

// ==========================================
// ENTERPRISE
// ==========================================

if (plan === "enterprise") {
  const monthlyFee =
    Number(partner.monthlyFee);

  if (
    !Number.isFinite(monthlyFee) ||
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

  recordedAmount =
    Math.round(monthlyFee * 100);
}

// ==========================================
// STARTER / BUSINESS
//
// The amount comes from our plan configuration.
// Paystack's recurring plan controls the
// actual subscription amount.
// ==========================================

else {
  const monthlyFee =
    Number(planConfig.monthlyFee);

  if (
    !Number.isFinite(monthlyFee) ||
    monthlyFee <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Partner plan does not have a valid monthly fee.",
      },
      {
        status: 400,
      }
    );
  }

  recordedAmount =
    Math.round(monthlyFee * 100);
}

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

  paystackData,
});

        } catch (error: unknown) {
    console.error(
      "PAYSTACK PARTNER INITIALIZATION ERROR:",
      error
    );

    let errorMessage =
      "Unknown error";

    if (error instanceof Error) {
      errorMessage =
        error.message;
    }

    if (axios.isAxiosError(error)) {
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
            "Unable to initialize partner payment.",

          details:
            errorMessage,

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
          "Unable to initialize partner payment.",

        details:
          errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}
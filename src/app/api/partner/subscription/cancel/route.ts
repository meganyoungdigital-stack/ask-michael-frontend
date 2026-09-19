import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectToDatabase } from "@/lib/mongodb";
import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";

    const sessionToken = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) =>
        cookie.startsWith(
          `${PARTNER_SESSION_COOKIE}=`
        )
      )
      ?.split("=")
      .slice(1)
      .join("=");

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const session =
      await verifyPartnerSession(sessionToken);

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

        if (!ObjectId.isValid(session)) {
      return NextResponse.json(
        {
          error: "Invalid partner account.",
        },
        {
          status: 400,
        }
      );
    }

    const { db } =
      await connectToDatabase();

    const partnerId =
      new ObjectId(session);

    const partner =
      await db.collection("partners").findOne(
        {
          _id: partnerId,
        },
        {
          projection: {
            subscriptionStatus: 1,
            paystackSubscriptionCode: 1,
          },
        }
      );

    if (!partner) {
      return NextResponse.json(
        {
          error: "Partner account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      partner.subscriptionStatus !==
      "active"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Your subscription is already not active.",
      });
    }

        // ==========================================
    // GET PAYSTACK SUBSCRIPTION CODE
    // ==========================================

    let paystackSubscriptionCode =
      partner.paystackSubscriptionCode || null;

    // Older partner accounts may have the subscription
    // code stored only on the original payment record.
    if (!paystackSubscriptionCode) {
      const subscriptionPayment =
        await db
          .collection("partner_payments")
          .findOne(
            {
              partnerId: partner._id,
              paymentType:
                "partner_subscription",
              status: "paid",
              subscriptionCode: {
                $exists: true,
                $nin: [null, ""],
              },
            },
            {
              projection: {
                subscriptionCode: 1,
              },
              sort: {
                createdAt: -1,
              },
            }
          );

      paystackSubscriptionCode =
        subscriptionPayment?.subscriptionCode ||
        null;
    }

    if (!paystackSubscriptionCode) {
  const subscriptionPayments =
    await db
      .collection("partner_payments")
      .find(
        {
          partnerId: partner._id,
        },
        {
          projection: {
            paymentType: 1,
            status: 1,
            subscriptionCode: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

  console.error(
    "Partner cancellation: no subscription code found.",
    {
      partnerId: partner._id.toString(),
      partnerSubscriptionCode:
        partner.paystackSubscriptionCode || null,
      recentSubscriptionPayments:
        subscriptionPayments.map((payment) => ({
          paymentType: payment.paymentType || null,
          status: payment.status || null,
          hasSubscriptionCode:
            Boolean(payment.subscriptionCode),
          createdAt: payment.createdAt || null,
        })),
    }
  );

  return NextResponse.json(
    {
      error:
        "No Paystack subscription is linked to this partner account.",
    },
    {
      status: 400,
    }
  );
}

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYSTACK_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Payment system is not configured correctly.",
        },
        {
          status: 500,
        }
      );
    }

    const paystackResponse =
      await fetch(
        `https://api.paystack.co/subscription/${encodeURIComponent(
          paystackSubscriptionCode
        )}/manage/link`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${secretKey}`,
          },
          cache: "no-store",
        }
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData.status ||
      !paystackData.data?.link
    ) {
      console.error(
        "Paystack subscription management link failed:",
        paystackData
      );

      return NextResponse.json(
        {
          error:
            paystackData.message ||
            "Unable to open Paystack subscription management.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,
      managementUrl:
        paystackData.data.link,
    });
  } catch (error) {
    console.error(
      "Partner subscription cancellation failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process subscription cancellation.",
      },
      {
        status: 500,
      }
    );
  }
}
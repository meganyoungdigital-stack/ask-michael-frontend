import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import {
  PARTNER_SESSION_COOKIE,
  verifyPartnerSession,
} from "@/lib/partnerAuth";
import { ObjectId } from "mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";

export async function GET(req: Request) {
  try {
   const cookieStore = await cookies();

const session =
  cookieStore.get(
    PARTNER_SESSION_COOKIE
  )?.value;

const partnerId =
  await verifyPartnerSession(session);

if (!partnerId) {
  return NextResponse.json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

if (!ObjectId.isValid(partnerId)) {
  return NextResponse.json(
    {
      error: "Invalid partner session",
    },
    {
      status: 401,
    }
  );
}

const { db } =
  await connectToDatabase();

const partner =
  await db
    .collection("partners")
    .findOne({
      _id: new ObjectId(partnerId),
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

    /* ============================
       CALCULATE PARTNER BILLING
    ============================ */

    const billing =
  calculatePartnerBilling({
    messages: partner.messages,
    includedMessages:
      partner.includedMessages,
    billedExtraMessages:
      partner.billedExtraMessages,
    pricePerMessage:
      partner.pricePerMessage,
    monthlyFee:
      partner.monthlyFee,
  });

    return NextResponse.json({
      companyName:
        partner.companyName,

      contactName:
        partner.contactName,

      email:
        partner.email,

            hasApiKey:
        Boolean(partner.apiKey),

      hasTestApiKey:
        Boolean(partner.testApiKey),

      messages:
        partner.messages || 0,

      plan:
        partner.plan || null,

      currency:
        partner.currency || null,

      monthlyFee:
        partner.monthlyFee ?? null,

      includedMessages:
  partner.includedMessages ?? null,

billedExtraMessages:
  partner.billedExtraMessages ?? 0,

pricePerMessage:
  partner.pricePerMessage ?? null,

      maxUsers:
        partner.maxUsers ?? null,

      maxMessages:
        partner.maxMessages ?? null,

      /* ============================
         BILLING VALUES
      ============================ */

      currentBill:
        billing.totalBill,

      extraMessages:
        billing.extraMessages,

      extraUsageCharge:
        billing.extraUsageCharge,

      status:
        partner.status,

      subscriptionStatus:
  partner.subscriptionStatus ||
  "inactive",

paymentStatus:
  partner.paymentStatus ||
  "unpaid",

nextBillingDate:
  partner.nextBillingDate || null,
    });
  } catch (error) {
    console.error(
      "Partner dashboard error:",
      error
    );

    return NextResponse.json(
      {
        error: "Dashboard failed",
      },
      {
        status: 500,
      }
    );
  }
}
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { calculatePartnerBilling } from "@/lib/partnerBilling";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json(
        {
          error: "Missing token",
        },
        {
          status: 400,
        }
      );
    }

    if (!ObjectId.isValid(token)) {
      return NextResponse.json(
        {
          error: "Invalid partner token",
        },
        {
          status: 400,
        }
      );
    }

    const { db } = await connectToDatabase();

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

    /* ============================
       CALCULATE PARTNER BILLING
    ============================ */

    const billing =
      calculatePartnerBilling({
        messages: partner.messages,
        includedMessages:
          partner.includedMessages,
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

      apiKey:
        partner.apiKey,

      testApiKey:
        partner.testApiKey || null,

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
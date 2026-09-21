import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { partnerRegistrationRatelimit } from "@/lib/ratelimit";


import {
  generatePartnerApiKey,
  hashPartnerApiKey,
} from "@/lib/partnerApiKeys";



export async function POST(req: Request) {

  try {

    const {
  token,
  password,
  acceptedTerms,
} = await req.json();

const rateLimitResult =
  await partnerRegistrationRatelimit.limit(
    token?.toString() || "unknown"
  );

if (!rateLimitResult.success) {
  return NextResponse.json(
    {
      error:
        "Too many registration attempts. Please try again later.",
    },
    {
      status: 429,
    }
  );
}

    // =====================================================
    // VALIDATE REGISTRATION DETAILS
    // =====================================================

    if (!token || !password) {

  return NextResponse.json(
    {
      error: "Missing registration details",
    },
    {
      status: 400,
    }
  );

}

if (acceptedTerms !== true) {

  return NextResponse.json(
    {
      error:
        "You must accept the Terms and Conditions before creating your account.",
    },
    {
      status: 400,
    }
  );

}



    const { db } =
      await connectToDatabase();

const tokenHash =
  crypto
    .createHash("sha256")
    .update(token.toString())
    .digest("hex");


    // =====================================================
    // FIND INVITATION
    // =====================================================

    const invitation =
      await db
        .collection("partner_invitations")
       .findOne({
  tokenHash,
  status: "pending",
});

   if (!invitation) {
  return NextResponse.json(
    { error: "Invalid or expired registration link" },
    { status: 404 }
  );
}

if (
  invitation.expiresAt &&
  new Date(invitation.expiresAt).getTime() <= Date.now()
) {
  return NextResponse.json(
    { error: "Invalid or expired registration link" },
    { status: 404 }
  );
}


    // =====================================================
    // CHECK IF PARTNER ALREADY EXISTS
    // =====================================================

    const existingPartner =
      await db
        .collection("partners")
        .findOne({
          email:
            invitation.email,
        });



    if (existingPartner) {

      return NextResponse.json(
        {
          error:
            "Partner already registered",
        },
        {
          status: 400,
        }
      );

    }



    // =====================================================
    // HASH PASSWORD
    // =====================================================

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );



    // =====================================================
// GENERATE API KEYS
// =====================================================

const apiKey =
  generatePartnerApiKey("am_live_");

const testApiKey =
  generatePartnerApiKey("am_test_");

const apiKeyHash =
  hashPartnerApiKey(apiKey);

const testApiKeyHash =
  hashPartnerApiKey(testApiKey);


    // =====================================================
    // BILLING DATES
    // =====================================================

    const createdAt =
      new Date();


    const billingDay =
      createdAt.getDate();


    const nextBillingDate =
      new Date(createdAt);


    nextBillingDate.setMonth(
      nextBillingDate.getMonth() + 1
    );



    // =====================================================
    // CREATE PARTNER ACCOUNT
    // =====================================================

    await db
      .collection("partners")
      .insertOne({

        companyName:
          invitation.companyName,

        contactName:
          invitation.contactName,

        email:
          invitation.email,

        passwordHash,

        apiKeyHash,

        testApiKeyHash,

        status:
  "active",

subscriptionStatus:
  "pending",

paymentStatus:
  "unpaid",


        // ===============================================
        // PLAN INFORMATION FROM ADMIN APPROVAL
        // ===============================================

        plan:
          invitation.plan,

        currency:
          invitation.currency,

        monthlyFee:
          invitation.monthlyFee,

        includedMessages:
          invitation.includedMessages,

        pricePerMessage:
          invitation.pricePerMessage,

        maxUsers:
          invitation.maxUsers,

        maxMessages:
          invitation.maxMessages,


        // ===============================================
        // USAGE
        // ===============================================

        messages:
          0,


        // ===============================================
        // BILLING
        // ===============================================

        billingDay,

        nextBillingDate,

        // ===============================================
// TERMS AND CONDITIONS
// ===============================================

termsAccepted: acceptedTerms,

termsVersion: "2026-08-24",

termsAcceptedAt: acceptedTerms
  ? new Date()
  : null,

        // ===============================================
        // ACCOUNT DATES
        // ===============================================

        createdAt,

        updatedAt:
          createdAt,

      });



    // =====================================================
    // MARK INVITATION AS USED
    // =====================================================

   await db
  .collection("partner_invitations")
  .updateOne(
    {
      tokenHash,
      status: "pending",
    },
    {
      $set: {
        status: "used",
        usedAt: createdAt,
      },
    }
  );

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        success: true,
      }
    );



  } catch (error) {

    console.error(
      "Partner registration error:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Registration failed",
      },
      {
        status: 500,
      }
    );

  }

}
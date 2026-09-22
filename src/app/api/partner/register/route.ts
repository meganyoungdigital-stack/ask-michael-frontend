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

   const body = await req.json();

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    {
      error: "Invalid request body",
    },
    {
      status: 400,
    }
  );
}

const {
  token,
  password,
  acceptedTerms,
} = body as {
  token?: unknown;
  password?: unknown;
  acceptedTerms?: unknown;
};

if (
  typeof token !== "string" ||
  typeof password !== "string" ||
  typeof acceptedTerms !== "boolean"
) {
  return NextResponse.json(
    {
      error: "Invalid registration details",
    },
    {
      status: 400,
    }
  );
}

const cleanToken = token.trim();
const cleanPassword = password;

if (
  cleanToken.length === 0 ||
  cleanPassword.length === 0
) {
  return NextResponse.json(
    {
      error: "Registration details cannot be empty",
    },
    {
      status: 400,
    }
  );
}

if (
  cleanToken.length > 200 ||
  cleanPassword.length > 200
) {
  return NextResponse.json(
    {
      error:
        "Registration details exceed the maximum allowed length",
    },
    {
      status: 400,
    }
  );
}

const rateLimitResult =
  await partnerRegistrationRatelimit.limit(
    cleanToken
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
    .update(cleanToken)
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
    cleanPassword,
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
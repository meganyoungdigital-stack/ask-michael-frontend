import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import bcrypt from "bcrypt";

import crypto from "crypto";



export async function POST(req: Request) {

  try {

    const {
      token,
      password,
    } = await req.json();



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



    const { db } =
      await connectToDatabase();



    // =====================================================
    // FIND INVITATION
    // =====================================================

    const invitation =
      await db
        .collection("partner_invitations")
        .findOne({
          token,
          status: "pending",
        });



    if (!invitation) {

      return NextResponse.json(
        {
          error:
            "Invalid or expired registration link",
        },
        {
          status: 404,
        }
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
      "am_live_" +
      crypto
        .randomBytes(24)
        .toString("hex");


    const testApiKey =
      "am_test_" +
      crypto
        .randomBytes(24)
        .toString("hex");



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

        apiKey,

        testApiKey,

        status:
          "active",


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
          token,
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
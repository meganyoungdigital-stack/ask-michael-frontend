import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectToDatabase } from "@/lib/mongodb";

/* ============================
VERIFY PAYSTACK PAYMENT
============================ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, userId, plan } = body;

    if (!reference || !userId || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ============================
    CONNECT DB EARLY
    ============================ */

    const { db } = await connectToDatabase();

    /* ============================
    PREVENT DUPLICATE PROCESSING
    ============================ */

    const existingTx = await db.collection("transactions").findOne({
      reference,
    });

    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: "Transaction already processed",
        tier: existingTx.tier,
      });
    }

    /* ============================
    VERIFY WITH PAYSTACK
    ============================ */

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = verifyRes.data?.data;

    if (!data || data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    /* ============================
    EXTRA VALIDATION (IMPORTANT)
    ============================ */

    if (!data.amount || !data.customer?.email) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }

    /* ============================
    TRUST PAYSTACK METADATA (NOT FRONTEND)
    ============================ */

    const paidPlan = data.metadata?.plan;

    if (!paidPlan) {
      return NextResponse.json(
        { error: "Missing plan metadata" },
        { status: 400 }
      );
    }

    /* ============================
    DETERMINE TIER
    ============================ */

    let tier: "free" | "pro" | "pro_plus" = "free";

    if (paidPlan === "pro") {
      tier = "pro";
    }

    if (paidPlan === "pro_plus") {
      tier = "pro_plus";
    }

    /* ============================
    UPDATE USER IN DATABASE
    ============================ */

    await db.collection("users").updateOne(
      { userId },
      {
        $set: {
          tier,
        },
      },
      { upsert: true }
    );

    /* ============================
    STORE TRANSACTION (CRITICAL)
    ============================ */

    await db.collection("transactions").insertOne({
      reference,
      userId,
      tier,
      amount: data.amount,
      email: data.customer.email,
      createdAt: new Date(),
    });

    /* ============================
    SUCCESS RESPONSE
    ============================ */

    return NextResponse.json({
      success: true,
      tier,
    });

  } catch (error: any) {
    console.error(
      "🔥 PAYSTACK VERIFY ERROR:",
      error?.response?.data || error
    );

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
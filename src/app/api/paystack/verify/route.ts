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
    DETERMINE TIER
    ============================ */

    let tier: "free" | "pro" = "free";

    if (plan === "pro") {
      tier = "pro";
    }

    // future: pro_plus support
    // if (plan === "pro_plus") tier = "pro_plus";

    /* ============================
    UPDATE USER IN DATABASE
    ============================ */

    const { db } = await connectToDatabase();

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
    SUCCESS RESPONSE
    ============================ */

    return NextResponse.json({
      success: true,
      tier,
    });

  } catch (error: any) {
    console.error("🔥 PAYSTACK VERIFY ERROR:", error?.response?.data || error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/* ============================
   🧠 NEW: EMAIL SERVICE
============================ */

import { sendAlertEmail } from "@/lib/notifications";

/* ============================
   GET ALERTS
============================ */

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const alerts = await db
      .collection("alerts")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("Alerts fetch error:", err);

    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/* ============================
   🚨 CREATE ALERT (NEW)
============================ */

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();

    if (!data) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    /* ============================
       DETERMINE STATUS
    ============================ */

    let status = "NORMAL";

    if (data.temperature > 120) {
      status = "CRITICAL TEMP";
    } else if (data.pressure > 300) {
      status = "CRITICAL PRESSURE";
    }

    if (status === "NORMAL") {
      return NextResponse.json({ skipped: true });
    }

    /* ============================
       🔁 DEDUPLICATION (LAST 5 MIN)
    ============================ */

    const existing = await db.collection("alerts").findOne({
      userId,
      status,
      createdAt: {
        $gte: new Date(Date.now() - 5 * 60 * 1000),
      },
    });

    if (existing) {
      return NextResponse.json({ deduplicated: true });
    }

    /* ============================
       SAVE ALERT
    ============================ */

    const alertDoc = {
      userId,
      temperature: data.temperature,
      pressure: data.pressure,
      vibration: data.vibration,
      status,
      createdAt: new Date(),
    };

    await db.collection("alerts").insertOne(alertDoc);

    /* ============================
       📩 SEND EMAIL
    ============================ */

    await sendAlertEmail({
      subject: "🚨 Industrial Alert Triggered",
      message: `
Status: ${status}

Temperature: ${data.temperature}
Pressure: ${data.pressure}
Vibration: ${data.vibration}

Time: ${new Date().toLocaleString()}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Alert creation error:", err);

    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

/* ============================
   UPDATE ALERT STATUS
============================ */

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    await db.collection("alerts").updateOne(
      {
        _id: new ObjectId(alertId),
        userId,
      },
      {
        $set: {
          status, // "ACKNOWLEDGED" or "RESOLVED"
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Alert update error:", err);

    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
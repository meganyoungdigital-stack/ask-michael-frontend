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

if (
  !data ||
  typeof data !== "object" ||
  Array.isArray(data)
) {
  return NextResponse.json(
    { error: "Invalid alert data" },
    { status: 400 }
  );
}

    const { temperature, pressure, vibration } = data as {
  temperature?: unknown;
  pressure?: unknown;
  vibration?: unknown;
};

if (
  typeof temperature !== "number" ||
  !Number.isFinite(temperature) ||
  typeof pressure !== "number" ||
  !Number.isFinite(pressure) ||
  typeof vibration !== "number" ||
  !Number.isFinite(vibration)
) {
  return NextResponse.json(
    { error: "Invalid alert sensor values" },
    { status: 400 }
  );
}

const { db } = await connectToDatabase();

    /* ============================
       DETERMINE STATUS
    ============================ */

    let status = "NORMAL";

    if (temperature > 120) {
      status = "CRITICAL TEMP";
    } else if (pressure > 300) {
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
      temperature,
      pressure,
      vibration,
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

if (
  !body ||
  typeof body !== "object" ||
  Array.isArray(body)
) {
  return NextResponse.json(
    { error: "Invalid request body" },
    { status: 400 }
  );
}

const { alertId, status } = body as {
  alertId?: unknown;
  status?: unknown;
};

if (
  typeof alertId !== "string" ||
  typeof status !== "string" ||
  alertId.trim().length === 0 ||
  status.trim().length === 0
) {
  return NextResponse.json(
    { error: "Invalid alert details" },
    { status: 400 }
  );
}

const cleanAlertId = alertId.trim();
const cleanStatus = status.trim();

if (!ObjectId.isValid(cleanAlertId)) {
  return NextResponse.json(
    { error: "Invalid alert ID" },
    { status: 400 }
  );
}

if (
  !["ACKNOWLEDGED", "RESOLVED"].includes(cleanStatus)
) {
  return NextResponse.json(
    { error: "Invalid alert status" },
    { status: 400 }
  );
}

    const { db } = await connectToDatabase();

    await db.collection("alerts").updateOne(
      {
        _id: new ObjectId(cleanAlertId),
        userId,
      },
      {
        $set: {
          status: cleanStatus, // "ACKNOWLEDGED" or "RESOLVED"
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
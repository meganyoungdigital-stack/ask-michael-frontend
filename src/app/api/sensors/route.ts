import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";

/* ============================
   GET SENSOR DATA (LATEST)
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

    const data = await db
      .collection("sensor_data")
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Sensor fetch error:", err);

    return NextResponse.json(
      { error: "Failed to fetch sensor data" },
      { status: 500 }
    );
  }
}

/* ============================
   POST SENSOR DATA (SIMULATION)
============================ */

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const newData = {
      userId,
      sensorId: "sensor-1",
      timestamp: new Date(),
      temperature: 80 + Math.random() * 50,
      pressure: 200 + Math.random() * 150,
      vibration: Math.random() * 10,
      createdAt: new Date(),
    };

    await db.collection("sensor_data").insertOne(newData);

    return NextResponse.json({
      success: true,
      data: newData,
    });
  } catch (err) {
    console.error("Sensor insert error:", err);

    return NextResponse.json(
      { error: "Insert failed" },
      { status: 500 }
    );
  }
}
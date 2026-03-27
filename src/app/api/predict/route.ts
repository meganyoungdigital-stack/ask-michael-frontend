import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    /* ============================
       GET RECENT SENSOR DATA
    ============================ */

    const data = await db
      .collection("sensor_data")
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    if (!data.length) {
      return NextResponse.json({
        prediction: "No data",
      });
    }

    const recent = data.reverse();

    /* ============================
       SIMPLE TREND CALCULATION
    ============================ */

    const getTrend = (values: number[]) => {
      if (values.length < 2) return 0;

      let trend = 0;

      for (let i = 1; i < values.length; i++) {
        trend += values[i] - values[i - 1];
      }

      return trend / values.length;
    };

    const temps = recent.map((d) => d.temperature);
    const pressures = recent.map((d) => d.pressure);

    const tempTrend = getTrend(temps);
    const pressureTrend = getTrend(pressures);

    /* ============================
       PREDICTION LOGIC
    ============================ */

    let prediction = "System stable";
    let risk = "Low";
    let recommendation = "No action needed";

    if (tempTrend > 2) {
      prediction = "Temperature rising rapidly";
      risk = "High";
      recommendation =
        "Inspect cooling system and reduce load";
    }

    if (pressureTrend > 5) {
      prediction = "Pressure increasing";
      risk = "Medium";
      recommendation =
        "Check valves and pressure regulators";
    }

    return NextResponse.json({
      prediction,
      risk,
      recommendation,
      tempTrend,
      pressureTrend,
    });
  } catch (err) {
    console.error("Prediction error:", err);

    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}
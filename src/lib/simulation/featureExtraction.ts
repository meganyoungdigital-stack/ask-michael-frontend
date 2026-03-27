import { connectToDatabase } from "@/lib/mongodb";

/* ============================
   EXTRACT FEATURES
============================ */

export async function extractFeatures(sensorId: string) {
  const { db } = await connectToDatabase();

  const data = await db
    .collection("sensor_data")
    .find({ sensorId })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  if (!data.length) return null;

  const temps = data.map((d) => d.temperature || 0);
  const pressures = data.map((d) => d.pressure || 0);

  const avgTemp =
    temps.reduce((a, b) => a + b, 0) / temps.length;

  const avgPressure =
    pressures.reduce((a, b) => a + b, 0) /
    pressures.length;

  const tempTrend = temps[0] - temps[temps.length - 1];

  return {
    avgTemp,
    avgPressure,
    tempTrend,
    sampleSize: data.length,
  };
}
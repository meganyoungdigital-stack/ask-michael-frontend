import { connectToDatabase } from "@/lib/mongodb";

/* ============================
   SENSOR DATA TYPE
============================ */

export type SensorData = {
  sensorId: string;
  timestamp: Date;
  temperature?: number;
  pressure?: number;
  vibration?: number;
};

/* ============================
   INGEST SENSOR DATA
============================ */

export async function ingestSensorData(data: SensorData) {
  try {
    const { db } = await connectToDatabase();

    await db.collection("sensor_data").insertOne({
      ...data,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error("Ingestion error:", err);
    return { success: false };
  }
}
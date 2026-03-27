import { sendAlertEmail } from "@/lib/notificationService";
import { connectToDatabase } from "@/lib/mongodb";
import { evaluateAlert } from "@/lib/alerts";

/* ============================
   CREATE / UPSERT ALERT
============================ */

export async function processAlert(
  userId: string,
  data: any
) {
  try {
    const { db } = await connectToDatabase();

    const result = evaluateAlert(data);

    if (result.severity === "NORMAL") {
      return null;
    }

    /* ============================
       DEDUPLICATION WINDOW (2 min)
    ============================ */

    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const existing = await db.collection("alerts").findOne({
      userId,
      type: result.type,
      severity: result.severity,
      createdAt: { $gte: twoMinutesAgo },
    });

    if (existing) {
      return existing; // 🚫 prevent spam
    }

    /* ============================
       CREATE ALERT
    ============================ */

    const newAlert = {
      userId,
      type: result.type,
      severity: result.severity,
      message: result.message,
      value: result.value,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("alerts").insertOne(newAlert);
    /* ============================
   🔔 SEND NOTIFICATION
============================ */

if (
  newAlert.severity === "HIGH" ||
  newAlert.severity === "CRITICAL"
) {
  await sendAlertEmail(newAlert);
}

    return newAlert;
  } catch (err) {
    console.error("Alert processing error:", err);
    return null;
  }
}
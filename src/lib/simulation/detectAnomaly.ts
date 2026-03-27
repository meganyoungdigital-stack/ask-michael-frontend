import { extractFeatures } from "./featureExtraction";

/* ============================
   ANOMALY DETECTION
============================ */

export async function detectAnomaly(sensorId: string) {
  const features = await extractFeatures(sensorId);

  if (!features) return null;

  let anomalies: string[] = [];

  if (features.avgTemp > 120) {
    anomalies.push("High temperature detected");
  }

  if (features.tempTrend > 20) {
    anomalies.push("Rapid temperature increase");
  }

  if (features.avgPressure > 300) {
    anomalies.push("Pressure exceeds safe limits");
  }

  return {
    anomalies,
    riskLevel:
      anomalies.length === 0
        ? "low"
        : anomalies.length === 1
        ? "medium"
        : "high",
    features,
  };
}
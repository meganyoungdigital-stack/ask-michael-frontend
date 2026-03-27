import { detectAnomaly } from "./detectAnomaly";

/* ============================
   FAILURE PREDICTION
============================ */

export async function predictFailure(sensorId: string) {
  const result = await detectAnomaly(sensorId);

  if (!result) return null;

  let probability = 0;

  if (result.riskLevel === "low") probability = 0.1;
  if (result.riskLevel === "medium") probability = 0.5;
  if (result.riskLevel === "high") probability = 0.85;

  return {
    failureProbability: probability,
    recommendation:
      probability > 0.7
        ? "Immediate inspection required"
        : probability > 0.4
        ? "Schedule maintenance"
        : "System operating normally",
    details: result,
  };
}
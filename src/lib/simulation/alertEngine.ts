/* ============================
   TYPES
============================ */

export type AlertResult = {
  type: "temperature" | "pressure" | "none";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NORMAL";
  message: string;
  value?: number;
};

/* ============================
   MAIN ALERT EVALUATOR
============================ */

export function evaluateAlert(data: any): AlertResult {
  if (!data) {
    return {
      type: "none",
      severity: "NORMAL",
      message: "No data",
    };
  }

  /* ============================
     TEMPERATURE RULES
  ============================ */

  if (data.temperature > 150) {
    return {
      type: "temperature",
      severity: "CRITICAL",
      message: "🔥 Critical temperature - immediate shutdown required",
      value: data.temperature,
    };
  }

  if (data.temperature > 120) {
    return {
      type: "temperature",
      severity: "HIGH",
      message: "⚠️ High temperature detected",
      value: data.temperature,
    };
  }

  if (data.temperature > 100) {
    return {
      type: "temperature",
      severity: "MEDIUM",
      message: "Temperature above optimal range",
      value: data.temperature,
    };
  }

  /* ============================
     PRESSURE RULES
  ============================ */

  if (data.pressure > 400) {
    return {
      type: "pressure",
      severity: "CRITICAL",
      message: "💥 Critical pressure - risk of rupture",
      value: data.pressure,
    };
  }

  if (data.pressure > 300) {
    return {
      type: "pressure",
      severity: "HIGH",
      message: "⚠️ High pressure detected",
      value: data.pressure,
    };
  }

  if (data.pressure > 250) {
    return {
      type: "pressure",
      severity: "MEDIUM",
      message: "Pressure above normal range",
      value: data.pressure,
    };
  }

  /* ============================
     NORMAL
  ============================ */

  return {
    type: "none",
    severity: "NORMAL",
    message: "System operating normally",
  };
}

/* ============================
   🔁 BACKWARD COMPATIBILITY
============================ */

/* This keeps your old code working */

export function evaluateAlertLegacy(data: any): string {
  const result = evaluateAlert(data);

  if (result.severity === "CRITICAL") {
    return `CRITICAL ${result.type.toUpperCase()}`;
  }

  if (result.severity === "HIGH") {
    return `HIGH ${result.type.toUpperCase()}`;
  }

  return "NORMAL";
}
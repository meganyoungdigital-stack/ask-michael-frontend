export type AlertResult = {
  type: "temperature" | "pressure" | "none";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "NORMAL";
  message: string;
  value?: number;
};

export function evaluateAlert(data: any): AlertResult {
  if (!data) {
    return {
      type: "none",
      severity: "NORMAL",
      message: "No data",
    };
  }

  if (data.temperature > 150) {
    return {
      type: "temperature",
      severity: "CRITICAL",
      message: "🔥 Critical temperature",
      value: data.temperature,
    };
  }

  if (data.temperature > 120) {
    return {
      type: "temperature",
      severity: "HIGH",
      message: "⚠️ High temperature",
      value: data.temperature,
    };
  }

  if (data.pressure > 400) {
    return {
      type: "pressure",
      severity: "CRITICAL",
      message: "💥 Critical pressure",
      value: data.pressure,
    };
  }

  if (data.pressure > 300) {
    return {
      type: "pressure",
      severity: "HIGH",
      message: "⚠️ High pressure",
      value: data.pressure,
    };
  }

  return {
    type: "none",
    severity: "NORMAL",
    message: "System normal",
  };
}
"use client";

import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";

type Sensor = {
  temperature: number;
  pressure: number;
  vibration: number;
  timestamp: string;
};

type Alert = {
  message: string;
  timestamp: string;
};

export default function Dashboard() {
  const [data, setData] = useState<Sensor[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  /* ============================
     🧠 NEW AI STATE
  ============================ */

  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  /* ============================
     🔮 NEW PREDICTION STATE
  ============================ */

  const [prediction, setPrediction] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /* ============================
     FETCH DATA
  ============================ */

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sensors");
      const json = await res.json();

      const newData = json.data || [];
      setData(newData);

      detectAnomalies(newData[0]);

      /* ============================
         🧠 TRIGGER AI ON ANOMALY
      ============================ */

      if (
        newData[0]?.temperature > 120 ||
        newData[0]?.pressure > 300
      ) {
        fetchAIExplanation(newData[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================
     🔮 FETCH PREDICTION
  ============================ */

  const fetchPrediction = async () => {
    try {
      const res = await fetch("/api/predict");
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================
     POLLING
  ============================ */

  useEffect(() => {
    fetchData();
    fetchPrediction(); // initial call

    const interval = setInterval(() => {
      fetchData();
      fetchPrediction(); // 👈 added safely
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ============================
     SIMULATION
  ============================ */

  const startSimulation = () => {
    if (intervalRef.current) return;

    setIsSimulating(true);

    intervalRef.current = setInterval(() => {
      fetch("/api/sensors", { method: "POST" });
    }, 2000);
  };

  const stopSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsSimulating(false);
  };

  const latest = data[0];

  /* ============================
     🚨 ANOMALY DETECTION
  ============================ */

  const detectAnomalies = (point?: Sensor) => {
    if (!point) return;

    let newAlerts: Alert[] = [];

    if (point.temperature > 120) {
      newAlerts.push({
        message: "🔥 High temperature detected",
        timestamp: new Date().toISOString(),
      });
    }

    if (point.pressure > 300) {
      newAlerts.push({
        message: "⚠️ High pressure detected",
        timestamp: new Date().toISOString(),
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
    }
  };

  /* ============================
     🧠 AI EXPLANATION FETCH
  ============================ */

  const fetchAIExplanation = async (point: any) => {
    try {
      setLoadingAI(true);

      const res = await fetch("/api/alerts/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...point,
          userId: (window as any)?.Clerk?.user?.id || null,
        }),
      });

      const data = await res.json();

      setAiExplanation(data.result || "No explanation");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  /* ============================
     ALERT STATUS
  ============================ */

  const getAlert = () => {
    if (!latest) return "No data";

    if (latest.temperature > 120) return "🔥 HIGH TEMP";
    if (latest.pressure > 300) return "⚠️ HIGH PRESSURE";

    return "✅ NORMAL";
  };

  /* ============================
     CHART DATA
  ============================ */

  const chartData = [...data]
    .reverse()
    .map((d, i) => ({
      name: i,
      temperature: d.temperature,
      pressure: d.pressure,
      vibration: d.vibration,
      isTempAnomaly: d.temperature > 120,
      isPressureAnomaly: d.pressure > 300,
    }));

  /* ============================
     CUSTOM DOT (HIGHLIGHT)
  ============================ */

  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;

    if (payload.isTempAnomaly || payload.isPressureAnomaly) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="red"
        />
      );
    }

    return <Dot {...props} />;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Industrial Dashboard
      </h1>

      {/* CONTROLS */}
      <div className="flex gap-4">
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Simulation
        </button>

        <button
          onClick={stopSimulation}
          disabled={!isSimulating}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Simulation
        </button>

        <div>
          Status: {isSimulating ? "🟢 Running" : "🔴 Stopped"}
        </div>
      </div>

      {/* LIVE VALUES */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h2>Temperature</h2>
          <p>{latest?.temperature?.toFixed(2) || "--"}</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2>Pressure</h2>
          <p>{latest?.pressure?.toFixed(2) || "--"}</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h2>Vibration</h2>
          <p>{latest?.vibration?.toFixed(2) || "--"}</p>
        </div>
      </div>

      {/* ALERT STATUS */}
      <div className="p-4 bg-black text-white rounded">
        <h2>System Status</h2>
        <p>{getAlert()}</p>
      </div>

      {/* 🚨 ALERT PANEL */}
      <div className="bg-red-50 p-4 rounded shadow">
        <h2 className="font-semibold mb-2">
          Alert History
        </h2>

        {alerts.length === 0 && (
          <p>No alerts</p>
        )}

        {alerts.map((a, i) => (
          <div key={i} className="text-sm mb-1">
            {a.message} —{" "}
            {new Date(a.timestamp).toLocaleTimeString()}
          </div>
        ))}
      </div>

      {/* 🧠 AI EXPLANATION PANEL */}
      <div className="bg-blue-50 p-4 rounded shadow">
        <h2 className="font-semibold mb-2">
          AI Engineering Insight
        </h2>

        {loadingAI ? (
          <p>Analyzing...</p>
        ) : (
          <pre className="whitespace-pre-wrap text-sm">
            {aiExplanation || "No insights yet"}
          </pre>
        )}
      </div>

      {/* 🔮 PREDICTION PANEL */}
      <div className="bg-purple-50 p-4 rounded shadow">
        <h2 className="font-semibold mb-2">
          Predictive Analysis
        </h2>

        {!prediction ? (
          <p>No prediction yet</p>
        ) : (
          <div className="text-sm space-y-1">
            <p><strong>Prediction:</strong> {prediction.prediction}</p>
            <p><strong>Risk:</strong> {prediction.risk}</p>
            <p><strong>Recommendation:</strong> {prediction.recommendation}</p>
          </div>
        )}
      </div>

      {/* TEMPERATURE CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2>Temperature Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              dataKey="temperature"
              dot={renderDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PRESSURE CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2>Pressure Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              dataKey="pressure"
              dot={renderDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
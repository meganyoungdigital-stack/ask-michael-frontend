"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();

  const [tier, setTier] = useState("free");
  const [status, setStatus] = useState("inactive");
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        });

        const data = await res.json();

        setTier(data?.tier || "free");
        setStatus(data?.subscriptionStatus || "inactive");
      } catch {
        console.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= CANCEL ================= */

  async function handleCancel() {
    if (!confirm("Cancel your subscription?")) return;

    const res = await fetch("/api/subscription/cancel", {
      method: "POST",
    });

    if (res.ok) {
      alert("Subscription cancelled");
      setTier("free");
      setStatus("cancelled");
    } else {
      alert("Failed to cancel");
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading subscription...
      </div>
    );
  }

  return (
    <div className="p-10 text-white max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Subscription Management
      </h1>

      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
        <p className="mb-2">
          <span className="text-gray-400">Current Plan:</span>{" "}
          <span className="font-semibold capitalize">{tier}</span>
        </p>

        <p className="mb-6">
          <span className="text-gray-400">Status:</span>{" "}
          <span className="font-semibold capitalize">{status}</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/pricing")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Upgrade Plan
          </button>

          {tier !== "free" && (
            <button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
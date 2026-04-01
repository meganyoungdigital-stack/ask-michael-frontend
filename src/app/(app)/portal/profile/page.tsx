"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [tier, setTier] = useState("free");
  const [status, setStatus] = useState("inactive");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [occupation, setOccupation] = useState(""); // ✅ NEW

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

        setName(data?.name || "");
        setEmail(data?.email || "");
        setCompany(data?.company || "");
        setOccupation(data?.occupation || ""); // ✅ NEW
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

  /* ================= SAVE PROFILE ================= */

  async function handleSaveProfile() {
    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, company, occupation }), // ✅ NEW
    });

    if (res.ok) {
      alert("Profile updated");
    } else {
      alert("Failed to update profile");
    }
  }

  if (loading) {
    return <div className="p-10 text-white">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen overflow-y-auto text-white">
      <div className="pt-24 p-10 max-w-2xl mx-auto relative">

        {/* 🔥 BACK BUTTON */}
        <button
          onClick={() => router.push("/portal")}
          className="absolute top-6 left-6 text-sm text-gray-400 hover:text-white"
        >
          ← Back to Platform
        </button>

        <h1 className="text-2xl font-bold mb-6">
          Account & Subscription
        </h1>

        {/* ================= SUBSCRIPTION ================= */}

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
          <p className="mb-2">
            <span className="text-gray-400">Current Plan:</span>{" "}
            <span className="font-semibold capitalize">{tier}</span>
          </p>

          <p className="mb-6">
            <span className="text-gray-400">Status:</span>{" "}
            <span className="font-semibold capitalize">{status}</span>
          </p>

          <div className="flex gap-3 flex-wrap">
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

        {/* ================= PROFILE ================= */}

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-6 mb-16">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>

          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="bg-neutral-800 p-2 rounded"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-neutral-800 p-2 rounded"
            />

            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="bg-neutral-800 p-2 rounded"
            />

            {/* ✅ NEW OCCUPATION FIELD */}
            <input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Occupation (e.g. Engineer, Manager, Welder)"
              className="bg-neutral-800 p-2 rounded"
            />

            <button
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 py-2 rounded mt-2"
            >
              Save Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
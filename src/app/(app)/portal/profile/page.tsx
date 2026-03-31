"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  const [tier, setTier] = useState("free");
  const [status, setStatus] = useState("inactive");

  /* ================= LOAD USER ================= */

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
        });

        const data = await res.json();

        setName(data?.name || "");
        setCompany(data?.company || "");
        setEmail(data?.email || "");
        setTier(data?.tier || "free");
        setStatus(data?.subscriptionStatus || "inactive");
      } catch {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= SAVE ================= */

  async function handleSave() {
    setSaving(true);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          company,
          email,
        }),
      });

      if (!res.ok) throw new Error();

      alert("Profile updated successfully");
    } catch {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="pt-24 p-10 text-white max-w-2xl mx-auto">
      
      <h1 className="text-2xl font-bold mb-6">
        Profile Settings
      </h1>

      {/* ================= PROFILE CARD ================= */}

      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-4">
        
        <div>
          <label className="text-sm text-gray-400">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">
            Company
          </label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
            placeholder="Your company"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm"
            placeholder="Your email"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold mt-4"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* ================= SUBSCRIPTION ================= */}

      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-6">
        <h2 className="text-lg font-semibold mb-4">
          Subscription
        </h2>

        <p className="mb-2">
          <span className="text-gray-400">Plan:</span>{" "}
          <span className="capitalize">{tier}</span>
        </p>

        <p className="mb-4">
          <span className="text-gray-400">Status:</span>{" "}
          <span className="capitalize">{status}</span>
        </p>

        <a
          href="/portal/subscription"
          className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Manage Subscription
        </a>
      </div>
    </div>
  );
}
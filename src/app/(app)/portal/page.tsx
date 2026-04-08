"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function PortalPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const [loading, setLoading] = useState(true);

  /* =========================
     USAGE STATE
  ========================= */
  const [usage, setUsage] = useState({
    count: 0,
    limit: 10,
    isPro: false,
  });

  const remaining = usage.limit - usage.count;
  const isLimitReached = remaining <= 0;

  /* =========================
     AUTH GUARD
  ========================= */
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  /* =========================
     FETCH USAGE
  ========================= */
  async function fetchUsage() {
    try {
      const res = await fetch("/api/usage", {
        credentials: "include",
      });

      const data = await res.json();

      setUsage({
  count: typeof data.used === "number" ? data.used : 0,
  limit: typeof data.limit === "number" ? data.limit : 10,
  isPro: data.isPro || false,
});
    } catch (err) {
      console.error("Failed to fetch usage");
    }
  }

  useEffect(() => {
  fetchUsage();

  const handleRefresh = () => {
    fetchUsage();
  };

  window.addEventListener("refreshSidebar", handleRefresh);

  return () => {
    window.removeEventListener("refreshSidebar", handleRefresh);
  };
}, []);

  /* =========================
     CREATE CHAT
  ========================= */
  async function createChat() {
    if (isLimitReached) return;

    try {
      const res = await fetch("/api/conversation/new", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed request");
      }

      const data = await res.json();

      if (!data?.conversationId) {
        throw new Error("Invalid response");
      }

      router.push(`/portal/chat/${data.conversationId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start chat");
    }
  }

  /* =========================
     LOADING STATE
  ========================= */
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading portal...
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-white">

      <img
        src="/m-logo.png"
        className="w-16 mb-4"
        alt="Michael AI"
      />

      <h1 className="text-3xl font-bold mb-2">
        Ask Michael
      </h1>

      <p className="text-gray-400 mb-4">
        Your AI engineering assistant
      </p>

      {/* USAGE */}
      <p className="text-sm text-gray-400 mb-6">
        {isLimitReached
          ? "Daily message limit reached"
          : `${remaining} messages left today`}
      </p>

      {/* BUTTON */}
      <button
        onClick={createChat}
        disabled={isLimitReached}
        className={`px-6 py-3 rounded-lg font-semibold ${
          isLimitReached
            ? "bg-gray-600 cursor-not-allowed opacity-60"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLimitReached ? "Limit Reached" : "+ New Chat"}
      </button>

    </div>
  );
}
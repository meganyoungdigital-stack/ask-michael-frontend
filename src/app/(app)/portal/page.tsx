"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function PortalPage() {

  const router = useRouter();

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
     FETCH USAGE
  ========================= */

  async function fetchUsage() {
    try {
      const res = await fetch("/api/usage", {
        credentials: "include",
      });

      const data = await res.json();

      setUsage({
        count: data.count || 0,
        limit: data.limit || 10,
        isPro: data.isPro || false,
      });

    } catch (err) {
      console.error("Failed to fetch usage");
    }
  }

  useEffect(() => {
    fetchUsage();
  }, []);

  /* =========================
     CREATE CHAT
  ========================= */

  async function createChat() {

    // ✅ Prevent action if limit reached
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
     PAGE UI
  ========================= */

  return (

    <>

      {/* USER NOT SIGNED IN */}

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* USER SIGNED IN */}

      <SignedIn>

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

          {/* ✅ USAGE DISPLAY */}

          <p className="text-sm text-gray-400 mb-6">
            {isLimitReached
              ? "Daily message limit reached"
              : `${remaining} messages left today`}
          </p>

          {/* ✅ BUTTON WITH DISABLE */}

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

      </SignedIn>

    </>

  );

}
"use client";

import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export default function PortalPage() {

  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { redirectToSignIn } = useClerk();

  /* ========================
     PROTECT THE PAGE
  ======================== */

  useEffect(() => {

    if (isLoaded && !isSignedIn) {
      redirectToSignIn({ redirectUrl: "/portal" });
    }

  }, [isLoaded, isSignedIn, redirectToSignIn]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  /* ========================
     CREATE CHAT
  ======================== */

  async function createChat() {

    try {

      const res = await fetch("/api/conversation/new", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed request");
      }

      const data = await res.json();

      if (!data?.conversationId) {
        throw new Error("Invalid response");
      }

      router.push(`/conversation/${data.conversationId}`);

    } catch (error) {

      console.error(error);
      alert("Failed to start chat");

    }

  }

  return (

    <div className="flex flex-col items-center justify-center h-full text-center">

      <img
        src="/m-logo.png"
        className="w-16 mb-4"
        alt="Michael AI"
      />

      <h1 className="text-3xl font-bold mb-2">
        Ask Michael
      </h1>

      <p className="text-gray-400 mb-8">
        Your AI engineering assistant
      </p>

      <button
        onClick={createChat}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
      >
        + New Chat
      </button>

    </div>

  );

}
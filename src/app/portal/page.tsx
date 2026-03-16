"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function PortalPage() {

  const router = useRouter();

  /* =========================
     CREATE CHAT
  ========================= */

  async function createChat() {

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

        <div className="flex flex-col items-center justify-center h-screen text-center">

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

      </SignedIn>

    </>

  );

}
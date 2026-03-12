"use client";

import { useRouter } from "next/navigation";

export default function PortalPage() {

  const router = useRouter();

  async function createChat() {

    try {

      const res = await fetch("/api/conversation/new", {
        method: "POST",
      });

      const data = await res.json();

      router.push(`/conversation/${data.conversationId}`);

    } catch {

      alert("Failed to start chat");

    }

  }

  return (

    <div className="flex flex-col items-center justify-center h-full text-center">

      <div className="text-5xl mb-4">🤖</div>

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
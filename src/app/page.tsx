"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();

  async function handleNewChat() {
    const res = await fetch("/api/conversation/new", {
      method: "POST",
    });

    const data = await res.json();

    if (data?.conversationId) {
      router.push(`/conversation/${data.conversationId}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">

      <h1 className="text-4xl font-bold">
        Ask <span className="text-blue-600">Michael</span>
      </h1>

      <SignedOut>
        <div className="mt-6">
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl">
              Sign In to Start
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <button
          onClick={handleNewChat}
          className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl"
        >
          New Chat
        </button>
      </SignedIn>

    </div>
  );
}
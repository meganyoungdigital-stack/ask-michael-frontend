"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function PortalPage() {

  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {

    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    async function startConversation() {

      try {

        const res = await fetch("/api/conversation/new", {
          method: "POST",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        router.push(`/conversation/${data.conversationId}`);

      } catch (err) {

        console.error("Conversation start error:", err);

      }

    }

    startConversation();

  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex items-center justify-center h-screen text-gray-400">
      Loading AI Platform...
    </div>
  );
}
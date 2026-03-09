"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    async function startConversation() {
      try {
        const res = await fetch("/api/conversation/new", {
          method: "POST",
        });

        if (!res.ok) {
          throw new Error("Failed to create conversation");
        }

        const data = await res.json();

        if (data?.conversationId) {
          router.replace(`/conversation/${data.conversationId}`);
        } else {
          throw new Error("No conversation ID returned");
        }
      } catch (error) {
        console.error(error);
        router.replace("/");
      }
    }

    startConversation();
  }, [router]);

  return (
    <main className="h-screen flex items-center justify-center bg-black text-white">
      <p className="text-gray-400">Loading Ask Michael AI...</p>
    </main>
  );
}
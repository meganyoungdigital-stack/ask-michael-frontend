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

        const data = await res.json();

        if (data?.conversationId) {
          router.replace(`/conversation/${data.conversationId}`);
        }
      } catch (err) {
        console.error("Failed to create conversation");
      }
    }

    startConversation();
  }, [router]);

  return null;
}
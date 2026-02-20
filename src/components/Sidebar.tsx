"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  conversationId: string;
  title: string;
  starred: boolean;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();

  async function loadConversations() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setConversations(data);
  }

  async function toggleStar(conversationId: string) {
    await fetch(`/api/projects/${conversationId}/star`, {
      method: "PATCH",
    });

    loadConversations(); // refresh list
  }

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div style={{ width: "280px", background: "#111", color: "white", padding: "10px" }}>
      <h3>Projects</h3>

      {conversations.map((conv) => (
        <div
          key={conv.conversationId}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px",
            marginBottom: "6px",
            background: "#1e1e1e",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <span onClick={() => router.push(`/conversation/${conv.conversationId}`)}>
            {conv.title}
          </span>

          <button
            onClick={() => toggleStar(conv.conversationId)}
            style={{
              background: "none",
              border: "none",
              color: conv.starred ? "gold" : "gray",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ★
          </button>
        </div>
      ))}
    </div>
  );
}
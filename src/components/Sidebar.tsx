"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  async function loadConversations() {
    const res = await fetch("/api/conversation");
    const data = await res.json();
    setConversations(data);
  }

  useEffect(() => {
    loadConversations();
  }, []);

  async function toggleStar(id: string) {
    await fetch(`/api/projects/${id}/star`, {
      method: "PATCH",
    });

    loadConversations(); // refresh after toggle
  }

  return (
    <div
      style={{
        width: "260px",
        background: "#111",
        color: "white",
        padding: "20px",
        borderRight: "1px solid #222",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Projects</h2>

      {conversations.map((conv) => (
        <div
          key={conv.conversationId}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <Link
            href={`/conversation/${conv.conversationId}`}
            style={{
              color: "white",
              textDecoration: "none",
              flex: 1,
            }}
          >
            {conv.title}
          </Link>

          <button
            onClick={() => toggleStar(conv.conversationId)}
            style={{
              background: "none",
              border: "none",
              color: conv.starred ? "gold" : "gray",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ★
          </button>
        </div>
      ))}
    </div>
  );
}
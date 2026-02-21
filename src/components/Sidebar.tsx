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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    loadConversations();
  }

  async function deleteConversation(id: string) {
    if (!confirm("Delete this project?")) return;

    await fetch(`/api/conversation/${id}`, {
      method: "DELETE",
    });

    loadConversations();
  }

  async function renameConversation(id: string, currentTitle: string) {
    const newTitle = prompt("Enter new name:", currentTitle);
    if (!newTitle || newTitle.trim() === "") return;

    await fetch(`/api/conversation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    loadConversations();
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
      <h2 style={{ marginBottom: "20px", color: "red" }}>
        SIDEBAR LIVE
      </h2>

      {conversations.map((conv) => (
        <div
          key={conv.conversationId}
          onMouseEnter={() => setHoveredId(conv.conversationId)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
            padding: "8px",
            borderRadius: "6px",
            background:
              hoveredId === conv.conversationId ? "#1a1a1a" : "transparent",
          }}
        >
          <Link
            href={`/conversation/${conv.conversationId}`}
            style={{
              color: "white",
              textDecoration: "none",
              flexGrow: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {conv.title}
          </Link>

          {hoveredId === conv.conversationId && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginLeft: "8px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  renameConversation(conv.conversationId, conv.title);
                }}
                style={iconStyle}
              >
                ✏
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  deleteConversation(conv.conversationId);
                }}
                style={iconStyle}
              >
                🗑
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleStar(conv.conversationId);
                }}
                style={{
                  ...iconStyle,
                  color: conv.starred ? "gold" : "gray",
                }}
              >
                ★
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const iconStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  color: "gray",
};
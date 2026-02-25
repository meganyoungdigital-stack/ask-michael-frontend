"use client";

import { useState } from "react";
import Link from "next/link";

interface Conversation {
  id: string;
  title: string;
  starred?: boolean;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
}

export default function Sidebar({
  conversations,
  activeId,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // ⭐ TOGGLE STAR
  async function toggleStar(id: string) {
    await fetch(`/api/conversation/${id}/star`, {
      method: "PATCH",
    });
    window.location.reload();
  }

  // ✏ RENAME
  async function renameConversation(id: string, currentTitle: string) {
    const newTitle = prompt("Enter new name:", currentTitle);
    if (!newTitle?.trim()) return;

    await fetch(`/api/conversation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    window.location.reload();
  }

  // 🗑 DELETE
  async function deleteConversation(id: string) {
    if (!confirm("Delete this conversation?")) return;

    await fetch(`/api/conversation/${id}`, {
      method: "DELETE",
    });

    window.location.href = "/";
  }

  // ➕ NEW CHAT
  async function newConversation() {
    const res = await fetch("/api/conversation/new", {
      method: "POST",
    });

    const data = await res.json();

    if (data?.conversationId) {
      window.location.href = `/chat/${data.conversationId}`;
    }
  }

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  return (
    <aside
      style={{
        width: "260px",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        padding: "16px",
        color: "#374151",
      }}
    >
      {/* NEW CHAT BUTTON */}
      <button
        onClick={newConversation}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
          fontWeight: 600,
        }}
      >
        + New Chat
      </button>

      {/* PINNED */}
      {pinned.length > 0 && (
        <>
          <p style={sectionLabel}>Pinned</p>
          {pinned.map(renderConversation)}
        </>
      )}

      {/* ALL CHATS */}
      <p style={sectionLabel}>All Chats</p>
      {normal.map(renderConversation)}
    </aside>
  );

  function renderConversation(conv: Conversation) {
    const isActive = conv.id === activeId;

    return (
      <div
        key={conv.id}
        onMouseEnter={() => setHoveredId(conv.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          borderRadius: "6px",
          marginBottom: "6px",
          background: isActive
            ? "#e5e7eb"
            : hoveredId === conv.id
            ? "#f3f4f6"
            : "transparent",
        }}
      >
        <Link
          href={`/chat/${conv.id}`}
          style={{
            flex: 1,
            textDecoration: "none",
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: isActive ? 600 : 400,
          }}
        >
          {conv.title || "Untitled"}
        </Link>

        {hoveredId === conv.id && (
          <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
            <button onClick={() => toggleStar(conv.id)}>
              {conv.starred ? "⭐" : "☆"}
            </button>

            <button
              onClick={() =>
                renameConversation(conv.id, conv.title)
              }
            >
              ✏
            </button>

            <button onClick={() => deleteConversation(conv.id)}>
              🗑
            </button>
          </div>
        )}
      </div>
    );
  }
}

const sectionLabel = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  margin: "12px 0 6px",
};
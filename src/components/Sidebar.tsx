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
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 🔄 FETCH CONVERSATIONS
  async function fetchConversations() {
    try {
      setLoading(true);
      const res = await fetch("/api/conversation");
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Sidebar API did not return array:", data);
        setConversations([]);
        return;
      }

      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  // ⭐ TOGGLE STAR
  async function toggleStar(id: string) {
    await fetch(`/api/projects/${id}/star`, { method: "PATCH" });
    fetchConversations();
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

    fetchConversations();
  }

  // 🗑 DELETE
  async function deleteConversation(id: string) {
    if (!confirm("Delete this conversation?")) return;

    await fetch(`/api/conversation/${id}`, { method: "DELETE" });
    fetchConversations();
  }

  // ➕ NEW CHAT
  async function newConversation() {
    const res = await fetch("/api/conversation/new", { method: "POST" });
    const data = await res.json();

    if (data?.conversationId) {
      fetchConversations();
      window.location.href = `/conversation/${data.conversationId}`;
    }
  }

  const pinned = conversations.filter(c => c.starred);
  const normal = conversations.filter(c => !c.starred);

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

      {loading && <p style={{ fontSize: "14px", color: "#6b7280" }}>Loading…</p>}

      {!loading && pinned.length > 0 && (
        <>
          <p style={sectionLabel}>Pinned</p>
          {pinned.map(renderConversation)}
        </>
      )}

      {!loading && (
        <>
          <p style={sectionLabel}>All Chats</p>
          {normal.map(renderConversation)}
        </>
      )}
    </aside>
  );

  function renderConversation(conv: Conversation) {
    return (
      <div
        key={conv.conversationId}
        onMouseEnter={() => setHoveredId(conv.conversationId)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          borderRadius: "6px",
          marginBottom: "6px",
          background:
            hoveredId === conv.conversationId ? "#f3f4f6" : "transparent",
        }}
      >
        <Link
          href={`/conversation/${conv.conversationId}`}
          style={{
            flex: 1,
            textDecoration: "none",
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {conv.title}
        </Link>

        {hoveredId === conv.conversationId && (
          <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
            <button onClick={() => toggleStar(conv.conversationId)}>
              {conv.starred ? "⭐" : "☆"}
            </button>
            <button onClick={() => renameConversation(conv.conversationId, conv.title)}>✏</button>
            <button onClick={() => deleteConversation(conv.conversationId)}>🗑</button>
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
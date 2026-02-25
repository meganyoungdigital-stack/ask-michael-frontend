"use client";

import { useState } from "react";
import Link from "next/link";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

interface SidebarProps {
  conversations?: Conversation[];
  activeId?: string;
}

export default function Sidebar({
  conversations = [],
  activeId = "",
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  async function toggleStar(conversationId: string) {
    await fetch(`/api/conversation/${conversationId}/star`, {
      method: "PATCH",
    });
    window.location.reload();
  }

  async function renameConversation(
    conversationId: string,
    currentTitle: string
  ) {
    const newTitle = prompt("Enter new name:", currentTitle);
    if (!newTitle?.trim()) return;

    await fetch(`/api/conversation/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    window.location.reload();
  }

  async function deleteConversation(conversationId: string) {
    if (!confirm("Delete this conversation?")) return;

    await fetch(`/api/conversation/${conversationId}`, {
      method: "DELETE",
    });

    window.location.href = "/";
  }

  async function newConversation() {
    const res = await fetch("/api/conversation/new", {
      method: "POST",
    });

    const data = await res.json();

    if (data?.conversationId) {
      window.location.href = `/conversation/${data.conversationId}`;
    }
  }

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  return (
    <aside className="w-64 h-full flex-shrink-0 border-r bg-white flex flex-col">
      {/* HEADER */}
      <div className="p-4 border-b">
        <button
          onClick={newConversation}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + New Chat
        </button>
      </div>

      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-4">
        {pinned.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Pinned
            </p>
            {pinned.map(renderConversation)}
          </>
        )}

        <p className="text-xs font-semibold text-gray-500 mt-4 mb-2">
          All Chats
        </p>

        {normal.length === 0 && (
          <div className="text-sm text-gray-400">
            No conversations yet
          </div>
        )}

        {normal.map(renderConversation)}
      </div>
    </aside>
  );

  function renderConversation(conv: Conversation) {
    const isActive = conv.conversationId === activeId;

    return (
      <div
        key={conv.conversationId}
        onMouseEnter={() => setHoveredId(conv.conversationId)}
        onMouseLeave={() => setHoveredId(null)}
        className={`flex items-center px-3 py-2 rounded-lg mb-1 transition ${
          isActive ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
      >
        <Link
          href={`/conversation/${conv.conversationId}`}
          className={`flex-1 truncate ${
            isActive ? "font-semibold text-black" : "text-gray-700"
          }`}
        >
          {conv.title || "Untitled"}
        </Link>

        {hoveredId === conv.conversationId && (
          <div className="flex gap-2 ml-2 text-sm">
            <button onClick={() => toggleStar(conv.conversationId)}>
              {conv.starred ? "⭐" : "☆"}
            </button>

            <button
              onClick={() =>
                renameConversation(conv.conversationId, conv.title)
              }
            >
              ✏
            </button>

            <button onClick={() => deleteConversation(conv.conversationId)}>
              🗑
            </button>
          </div>
        )}
      </div>
    );
  }
}
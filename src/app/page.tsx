"use client";

import { useEffect, useState } from "react";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    const res = await fetch("/api/conversation");
    const data = await res.json();
    setConversations(data);
    setLoading(false);
  }

  // ⭐ TOGGLE STAR
  async function toggleStar(id: string) {
    await fetch(`/api/projects/${id}/star`, {
      method: "PATCH",
    });

    fetchConversations();
  }

  // ✏ RENAME
  async function renameConversation(id: string) {
    const newTitle = prompt("Enter new title:");
    if (!newTitle) return;

    await fetch(`/api/conversation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    fetchConversations();
  }

  // 🗑 DELETE
  async function deleteConversation(id: string) {
    const confirmDelete = confirm("Delete this conversation?");
    if (!confirmDelete) return;

    await fetch(`/api/conversation/${id}`, {
      method: "DELETE",
    });

    fetchConversations();
  }

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Conversations</h2>

        {pinned.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-2">Pinned</p>
            {pinned.map((conversation) => (
              <ConversationItem
                key={conversation.conversationId}
                conversation={conversation}
                toggleStar={toggleStar}
                renameConversation={renameConversation}
                deleteConversation={deleteConversation}
              />
            ))}
          </>
        )}

        <p className="text-xs text-gray-400 mt-4 mb-2">All Chats</p>
        {normal.map((conversation) => (
          <ConversationItem
            key={conversation.conversationId}
            conversation={conversation}
            toggleStar={toggleStar}
            renameConversation={renameConversation}
            deleteConversation={deleteConversation}
          />
        ))}
      </div>

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">AskMichael AI</h1>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  toggleStar,
  renameConversation,
  deleteConversation,
}: any) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-800 rounded group">
      <span className="truncate">{conversation.title}</span>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button onClick={() => toggleStar(conversation.conversationId)}>
          {conversation.starred ? "📌" : "📍"}
        </button>

        <button onClick={() => renameConversation(conversation.conversationId)}>
          ✏
        </button>

        <button onClick={() => deleteConversation(conversation.conversationId)}>
          🗑
        </button>
      </div>
    </div>
  );
}
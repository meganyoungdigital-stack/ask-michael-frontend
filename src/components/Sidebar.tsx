"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

interface Document {
  _id: string;
  name: string;
}

export default function Sidebar() {

  const router = useRouter();
  const params = useParams();
  const activeId = params?.conversationId as string;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, []);

  /* ---------------- FETCH ---------------- */

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversation/list");
      const data = await res.json();
      setConversations(data?.conversations || []);
    } catch {
      setConversations([]);
    }
  }

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(data?.documents || []);
    } catch {
      setDocuments([]);
    }
  }

  /* ---------------- DOCUMENT DELETE ---------------- */

  async function deleteDocument(id: string) {

    if (!confirm("Delete document?")) return;

    try {
      await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      setDocuments((prev) =>
        prev.filter((d) => d._id !== id)
      );
    } catch {
      alert("Failed to delete document");
    }
  }

  /* ---------------- CONVERSATION DELETE ---------------- */

  async function deleteConversation(id: string) {

    if (!confirm("Delete conversation?")) return;

    try {
      await fetch(`/api/conversation/${id}`, {
        method: "DELETE",
      });

      setConversations((prev) =>
        prev.filter((c) => c.conversationId !== id)
      );

      router.push("/portal");
    } catch {
      alert("Delete failed");
    }
  }

  /* ---------------- PIN / UNPIN ---------------- */

  async function togglePin(conv: Conversation) {

    try {

      await fetch(`/api/conversation/${conv.conversationId}/star`, {
        method: "POST",
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId
            ? { ...c, starred: !c.starred }
            : c
        )
      );

    } catch {
      alert("Pin action failed");
    }
  }

  /* ---------------- RENAME ---------------- */

  async function renameConversation(conv: Conversation) {

    const newTitle = prompt("Rename conversation", conv.title);

    if (!newTitle || newTitle.trim() === "") return;

    try {

      await fetch(`/api/conversation/${conv.conversationId}/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId
            ? { ...c, title: newTitle }
            : c
        )
      );

    } catch {
      alert("Rename failed");
    }
  }

  /* ---------------- SORT ---------------- */

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  return (
    <aside className="w-72 border-r border-gray-800 bg-neutral-950 text-white flex flex-col h-screen">

      {/* NEW CHAT */}

      <div className="p-4 border-b border-gray-800">

        <button
          onClick={() => router.push("/portal")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition"
        >
          + New Chat
        </button>

      </div>

      {/* LIST */}

      <div className="flex-1 overflow-y-auto min-h-0 p-4">

        {/* DOCUMENTS NOW AT TOP */}

        <div className="mb-6">

          <p className="text-xs text-gray-400 mb-2">Documents</p>

          {documents.length === 0 && (
            <p className="text-xs text-gray-500">No documents</p>
          )}

          {documents.map((doc) => (

            <div
              key={doc._id}
              className="flex items-center justify-between text-sm hover:bg-neutral-800 px-2 py-1 rounded"
            >

              <span className="truncate">📄 {doc.name}</span>

              <button
                onClick={() => deleteDocument(doc._id)}
                className="text-red-400 hover:text-red-500 text-xs ml-2"
              >
                ✕
              </button>

            </div>

          ))}

        </div>

        {/* PINNED */}

        {pinned.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-2">Pinned</p>
            {pinned.map(renderConversation)}
          </>
        )}

        {/* ALL CHATS */}

        <p className="text-xs text-gray-400 mt-4 mb-2">All Chats</p>

        {normal.map(renderConversation)}

      </div>

    </aside>
  );

  /* ---------------- RENDER CONVERSATION ---------------- */

  function renderConversation(conv: Conversation) {

    const active = conv.conversationId === activeId;

    return (
      <div
        key={conv.conversationId}
        onMouseEnter={() => setHoveredId(conv.conversationId)}
        onMouseLeave={() => setHoveredId(null)}
        className={`group flex items-center px-3 py-2 rounded-lg mb-1 transition ${
          active ? "bg-neutral-800" : "hover:bg-neutral-900"
        }`}
      >

        <Link
          href={`/conversation/${conv.conversationId}`}
          className="flex-1 truncate text-sm"
        >
          {conv.title || "Untitled"}
        </Link>

        {hoveredId === conv.conversationId && (

          <div className="flex gap-2 text-xs ml-2">

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePin(conv);
              }}
              title="Pin / Unpin"
            >
              {conv.starred ? "📌" : "⭐"}
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                renameConversation(conv);
              }}
              title="Rename"
            >
              ✏
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteConversation(conv.conversationId);
              }}
              title="Delete"
            >
              🗑
            </button>

          </div>

        )}

      </div>
    );
  }
}
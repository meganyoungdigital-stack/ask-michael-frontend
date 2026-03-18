"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

/* ================= TYPES ================= */

interface Conversation {
  conversationId: string;
  title: string;
  starred?: boolean;
}

interface Document {
  _id: string;
  name: string;
}

/* ================= COMPONENT ================= */

export default function Sidebar() {
  const router = useRouter();
  const params = useParams();

  const activeId =
    typeof params?.conversationId === "string"
      ? params.conversationId
      : "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= SAFE FETCH ================= */

  async function safeFetch(url: string, options?: RequestInit) {
    try {
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
        ...options,
      });

      if (!res.ok) return null;

      return await res.json();
    } catch {
      return null;
    }
  }

  /* ================= LOAD DATA ================= */

  async function loadSidebar() {
    setLoading(true);

    const [convData, docData] = await Promise.all([
      safeFetch("/api/conversation/list"),
      safeFetch("/api/documents"),
    ]);

    setConversations(
      Array.isArray(convData?.conversations)
        ? convData.conversations
        : []
    );

    setDocuments(
      Array.isArray(docData?.documents)
        ? docData.documents
        : []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadSidebar();
  }, []);

  /* ================= NEW CHAT (FIXED) ================= */

  async function createChat() {
    const data = await safeFetch("/api/conversation/new", {
      method: "POST", // ✅ FIXED
    });

    if (!data?.conversationId) {
      alert("Failed to create chat");
      return;
    }

    router.push(`/portal/chat/${data.conversationId}`);
  }

  /* ================= DELETE ================= */

  async function deleteConversation(id: string) {
    if (!confirm("Delete conversation?")) return;

    try {
      await fetch(`/api/conversation/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      setConversations((prev) =>
        prev.filter((c) => c.conversationId !== id)
      );

      if (activeId === id) {
        router.push("/portal");
      }
    } catch {
      alert("Delete failed");
    }
  }

  /* ================= PIN ================= */

  async function togglePin(conv: Conversation) {
    try {
      await fetch(
        `/api/conversation/${conv.conversationId}/star`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId
            ? { ...c, starred: !c.starred }
            : c
        )
      );
    } catch {
      alert("Pin failed");
    }
  }

  /* ================= SORT ================= */

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  /* ================= UI ================= */

  return (
    <aside className="group w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col text-white relative">

      {/* 🔥 HOVER TOP BAR */}

      <div className="absolute top-0 left-0 right-0 h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition duration-300 z-10">

        <span className="text-xs text-gray-400">
          Messages: 0
        </span>

        <div className="flex gap-3 text-xs">

          <button className="hover:text-blue-400">
            Upgrade
          </button>

          <button className="hover:text-blue-400">
            Share
          </button>

        </div>

      </div>

      {/* NEW CHAT */}

      <div className="p-4 border-b border-neutral-800 mt-2">
        <button
          onClick={createChat}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
        >
          + New Chat
        </button>
      </div>

      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto p-4">

        {/* DOCUMENTS */}

        <p className="text-xs text-gray-400 mb-2">
          Documents
        </p>

        {documents.length === 0 && (
          <p className="text-xs text-gray-500 mb-4">
            No documents
          </p>
        )}

        {documents.map((doc) => (
          <div
            key={doc._id}
            className="text-sm truncate mb-1"
          >
            📄 {doc.name}
          </div>
        ))}

        {/* PINNED */}

        {pinned.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mt-6 mb-2">
              Pinned
            </p>

            {pinned.map(renderConversation)}
          </>
        )}

        {/* CHATS */}

        <p className="text-xs text-gray-400 mt-6 mb-2">
          Chats
        </p>

        {loading && (
          <p className="text-xs text-gray-500">
            Loading chats...
          </p>
        )}

        {normal.map(renderConversation)}

      </div>

    </aside>
  );

  /* ================= RENDER ================= */

  function renderConversation(conv: Conversation) {
    const active =
      conv.conversationId === activeId;

    return (
      <div
        key={conv.conversationId}
        className={`flex items-center justify-between px-3 py-2 rounded mb-1 ${
          active
            ? "bg-neutral-800"
            : "hover:bg-neutral-900"
        }`}
      >
        <Link
          href={`/portal/chat/${conv.conversationId}`}
          className="truncate text-sm flex-1"
        >
          {conv.title || "Untitled Chat"}
        </Link>

        <div className="flex gap-2 text-xs ml-2">

          <button onClick={() => togglePin(conv)}>
            {conv.starred ? "📌" : "⭐"}
          </button>

          <button
            onClick={() =>
              deleteConversation(conv.conversationId)
            }
          >
            🗑
          </button>

        </div>
      </div>
    );
  }
}
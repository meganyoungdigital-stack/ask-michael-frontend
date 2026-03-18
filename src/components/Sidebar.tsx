"use client";

import { useEffect, useState, useRef } from "react";
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

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  /* ================= CLOSE MENU ================= */

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= LIVE REFRESH ================= */

  useEffect(() => {
    const refresh = () => loadSidebar();

    window.addEventListener("refreshSidebar", refresh);

    return () => {
      window.removeEventListener("refreshSidebar", refresh);
    };
  }, []);

  /* ================= FETCH ================= */

  async function safeFetch(url: string, options?: RequestInit) {
    try {
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
        ...options,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) return null;

      return data;
    } catch {
      return null;
    }
  }

  async function loadSidebar() {
    setLoading(true);

    const [convData, docData] = await Promise.all([
      safeFetch("/api/conversation/list"),
      safeFetch("/api/documents"),
    ]);

    setConversations(convData?.conversations || []);
    setDocuments(docData?.documents || []);

    setLoading(false);
  }

  useEffect(() => {
    loadSidebar();
  }, []);

  /* ================= ACTIONS ================= */

  async function createChat() {
    const res = await fetch("/api/conversation/new", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (data?.conversationId) {
      router.push(`/portal/chat/${data.conversationId}`);

      setTimeout(() => {
        window.dispatchEvent(new Event("refreshSidebar"));
      }, 100);
    }
  }

  async function deleteConversation(id: string) {
    if (!confirm("Delete conversation?")) return;

    await fetch(`/api/conversation/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setConversations((prev) =>
      prev.filter((c) => c.conversationId !== id)
    );

    if (activeId === id) router.push("/portal");
  }

  async function togglePin(conv: Conversation) {
    await fetch(`/api/conversation/${conv.conversationId}/star`, {
      method: "POST",
      credentials: "include",
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conv.conversationId
          ? { ...c, starred: !c.starred }
          : c
      )
    );
  }

  async function renameConversation(conv: Conversation) {
    const newTitle = prompt("Rename conversation:", conv.title);
    if (!newTitle) return;

    await fetch(`/api/conversation/${conv.conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conv.conversationId
          ? { ...c, title: newTitle }
          : c
      )
    );
  }

  /* ================= SORT ================= */

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  /* ================= ITEM ================= */

  function renderConversation(conv: Conversation) {
    const active = conv.conversationId === activeId;

    return (
      <div
        key={conv.conversationId}
        className={`group relative flex items-center px-3 py-2 rounded mb-1 ${
          active
            ? "bg-blue-600 text-white"
            : "hover:bg-neutral-900 text-gray-300"
        }`}
      >
        <Link
          href={`/portal/chat/${conv.conversationId}`}
          className="truncate text-sm flex-1"
        >
          {conv.title || "Untitled Chat"}
        </Link>

        <button
          onClick={() =>
            setOpenMenuId((prev) =>
              prev === conv.conversationId ? null : conv.conversationId
            )
          }
          className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
        >
          ⋯
        </button>

        {openMenuId === conv.conversationId && (
          <div
            ref={menuRef}
            className="absolute right-2 top-10 bg-neutral-900 border border-neutral-700 rounded shadow-lg z-20 text-sm w-32"
          >
            <button
              onClick={() => {
                togglePin(conv);
                setOpenMenuId(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-neutral-800"
            >
              {conv.starred ? "Unpin" : "Pin"}
            </button>

            <button
              onClick={() => {
                renameConversation(conv);
                setOpenMenuId(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-neutral-800"
            >
              Rename
            </button>

            <button
              onClick={() => {
                deleteConversation(conv.conversationId);
                setOpenMenuId(null);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <aside
      className="w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col text-white relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 🔥 HOVER TOP PANEL */}
      <div
        className={`absolute top-0 left-0 w-full bg-neutral-950 border-b border-neutral-800 p-4 space-y-3 transition-all duration-300 z-10 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="text-xs text-gray-400">
          Messages: {conversations.length}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 text-xs bg-neutral-800 hover:bg-neutral-700 py-1 rounded">
            Share
          </button>

          <button className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 py-1 rounded">
            Upgrade
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
      <div className="flex-1 overflow-y-auto p-4 mt-2">
        <p className="text-xs text-gray-400 mb-2">Documents</p>

        {documents.map((doc) => (
          <div key={doc._id} className="text-sm truncate mb-1">
            📄 {doc.name}
          </div>
        ))}

        {pinned.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mt-6 mb-2">Pinned</p>
            {pinned.map(renderConversation)}
          </>
        )}

        <p className="text-xs text-gray-400 mt-6 mb-2">Chats</p>

        {loading && (
          <p className="text-xs text-gray-500">Loading chats...</p>
        )}

        {normal.map(renderConversation)}
      </div>
    </aside>
  );
}
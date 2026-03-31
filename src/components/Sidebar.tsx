"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

/* ✅ NEW ICONS */
import { Share2, CreditCard, User, Plus } from "lucide-react";

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
    const refresh = async () => {
      const convData = await safeFetch("/api/conversation/list");

      if (convData?.conversations) {
        setConversations(convData.conversations);
      }
    };

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

  /* ================= SHARE ================= */

  async function handleShare() {
    const url = "https://askmichaelai.org";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ask Michael AI",
          text: "Check out this AI engineering assistant",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      }
    } catch {
      alert("Unable to share right now.");
    }
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
        className={`group relative flex items-center px-3 py-2 rounded-lg mb-1 ${
          active
            ? "bg-neutral-800 text-white"
            : "text-gray-400 hover:text-white hover:bg-neutral-900"
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
    <aside className="w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col text-white">
      
      {/* TOP ACTIONS */}
      <div className="p-4 border-b border-neutral-800 space-y-2">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 text-sm bg-neutral-800 hover:bg-neutral-700 py-2 rounded-lg"
        >
          <Share2 size={16} />
          Share
        </button>

        <button
          onClick={() => router.push("/portal/subscription")}
          className="w-full flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
        >
          <CreditCard size={16} />
          Subscription
        </button>
      </div>

      {/* NEW CHAT */}
      <div className="p-4 border-b border-neutral-800">
        <button
          onClick={createChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
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

      {/* BOTTOM */}
      <div className="p-4 border-t border-neutral-800">
        <Link
          href="/portal/profile"
          className="w-full flex items-center justify-center gap-2 text-sm bg-neutral-800 hover:bg-neutral-700 py-2 rounded-lg"
        >
          <User size={16} />
          Profile
        </Link>
      </div>
    </aside>
  );
}
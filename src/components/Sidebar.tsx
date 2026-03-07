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

  async function fetchConversations() {
    const res = await fetch("/api/conversation/list");
    const data = await res.json();
    setConversations(data?.conversations || []);
  }

  async function fetchDocuments() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data?.documents || []);
  }

  async function uploadDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    fetchDocuments();
  }

  async function newConversation() {
    const res = await fetch("/api/conversation/new", {
      method: "POST",
    });

    const data = await res.json();

    if (data?.conversationId) {
      router.push(`/conversation/${data.conversationId}`);
      fetchConversations();
    }
  }

  async function toggleStar(id: string) {
    await fetch(`/api/conversation/${id}/star`, {
      method: "PATCH",
    });

    fetchConversations();
  }

  async function renameConversation(id: string, currentTitle: string) {
    const newTitle = prompt("Enter new name:", currentTitle);
    if (!newTitle?.trim()) return;

    await fetch(`/api/conversation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });

    fetchConversations();
  }

  async function deleteConversation(id: string) {
    if (!confirm("Delete this conversation?")) return;

    await fetch(`/api/conversation/${id}`, {
      method: "DELETE",
    });

    await fetchConversations();

    router.push("/app");
    router.refresh();
  }

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  return (
    <aside className="w-64 border-r bg-white flex flex-col">

      {/* New Chat */}

      <div className="p-4 border-b">
        <button
          onClick={newConversation}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">

        {/* Pinned */}

        {pinned.length > 0 && (
          <>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Pinned
            </p>
            {pinned.map(renderConversation)}
          </>
        )}

        {/* All Chats */}

        <p className="text-xs font-semibold text-gray-500 mt-4 mb-2">
          All Chats
        </p>

        {normal.length === 0 && (
          <div className="text-sm text-gray-400">
            No conversations yet
          </div>
        )}

        {normal.map(renderConversation)}

        {/* Documents */}

        <div className="mt-6 border-t pt-4">

          <p className="text-xs font-semibold text-gray-500 mb-2">
            Documents
          </p>

          {documents.length === 0 && (
            <div className="text-sm text-gray-400 mb-2">
              No documents uploaded
            </div>
          )}

          {documents.map((doc) => (
            <div
              key={doc._id}
              className="text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer truncate"
            >
              📄 {doc.name}
            </div>
          ))}

          {/* Upload */}

          <label className="block mt-2 text-sm text-blue-600 hover:underline cursor-pointer">
            + Upload
            <input
              type="file"
              className="hidden"
              onChange={uploadDocument}
            />
          </label>

        </div>

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
          <div className="flex gap-1 ml-2 text-xs">
            <button
              onClick={() => toggleStar(conv.conversationId)}
              className="hover:scale-110"
            >
              {conv.starred ? "⭐" : "☆"}
            </button>

            <button
              onClick={() =>
                renameConversation(conv.conversationId, conv.title)
              }
              className="hover:scale-110"
            >
              ✏
            </button>

            <button
              onClick={() =>
                deleteConversation(conv.conversationId)
              }
              className="hover:scale-110"
            >
              🗑
            </button>
          </div>
        )}
      </div>
    );
  }
}
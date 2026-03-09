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

  async function newConversation() {

    const res = await fetch("/api/conversation/new", { method: "POST" });
    const data = await res.json();

    if (data?.conversationId) {
      router.push(`/conversation/${data.conversationId}`);
      fetchConversations();
    }
  }

  async function toggleStar(id: string) {
    await fetch(`/api/conversation/${id}/star`, { method: "PATCH" });
    fetchConversations();
  }

  async function renameConversation(id: string, currentTitle: string) {

    const newTitle = prompt("Rename conversation:", currentTitle);

    if (!newTitle) return;

    await fetch(`/api/conversation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle })
    });

    fetchConversations();
  }

  async function deleteConversation(id: string) {

    if (!confirm("Delete conversation?")) return;

    await fetch(`/api/conversation/${id}`, { method: "DELETE" });

    fetchConversations();
    router.push("/platform");
  }

  async function uploadDocument(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/documents/upload", {
      method: "POST",
      body: formData
    });

    fetchDocuments();
  }

  const pinned = conversations.filter((c) => c.starred);
  const normal = conversations.filter((c) => !c.starred);

  return (

    <aside className="w-72 border-r border-gray-800 bg-neutral-950 text-white flex flex-col">

      {/* New Chat */}

      <div className="p-4 border-b border-gray-800">

        <button
          onClick={newConversation}
          className="w-full bg-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + New Chat
        </button>

      </div>

      <div className="flex-1 overflow-y-auto p-4">

        {/* Pinned */}

        {pinned.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-2">Pinned</p>
            {pinned.map(renderConversation)}
          </>
        )}

        {/* Chats */}

        <p className="text-xs text-gray-400 mt-4 mb-2">All Chats</p>

        {normal.length === 0 && (
          <p className="text-sm text-gray-500">No conversations yet</p>
        )}

        {normal.map(renderConversation)}

        {/* Documents */}

        <div className="mt-6 border-t border-gray-800 pt-4">

          <p className="text-xs text-gray-400 mb-2">Documents</p>

          {documents.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">No documents</p>
          )}

          {documents.map((doc) => (
            <div
              key={doc._id}
              className="text-sm hover:bg-neutral-800 px-2 py-1 rounded truncate"
            >
              📄 {doc.name}
            </div>
          ))}

          <label className="block mt-2 text-blue-400 text-sm cursor-pointer hover:underline">
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

    const active = conv.conversationId === activeId;

    return (
      <div
        key={conv.conversationId}
        onMouseEnter={() => setHoveredId(conv.conversationId)}
        onMouseLeave={() => setHoveredId(null)}
        className={`flex items-center px-3 py-2 rounded-lg mb-1 ${
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

            <button
              onClick={() =>
                deleteConversation(conv.conversationId)
              }
            >
              🗑
            </button>

          </div>
        )}

      </div>
    );
  }
}
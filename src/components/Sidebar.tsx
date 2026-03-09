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

  async function deleteDocument(id: string) {

    if (!confirm("Delete this document?")) return;

    await fetch(`/api/documents/${id}`, {
      method: "DELETE",
    });

    fetchDocuments();
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

      <div className="p-4 border-b border-gray-800">

        <button
          onClick={() => router.push("/portal")}
          className="w-full bg-blue-600 py-2 rounded-lg font-semibold"
        >
          + New Chat
        </button>

      </div>

      <div className="flex-1 overflow-y-auto p-4">

        {pinned.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-2">Pinned</p>
            {pinned.map(renderConversation)}
          </>
        )}

        <p className="text-xs text-gray-400 mt-4 mb-2">All Chats</p>

        {normal.map(renderConversation)}

        {/* DOCUMENTS */}

        <div className="mt-6 border-t border-gray-800 pt-4">

          <p className="text-xs text-gray-400 mb-2">Documents</p>

          {documents.map((doc) => (

            <div
              key={doc._id}
              className="flex items-center justify-between text-sm hover:bg-neutral-800 px-2 py-1 rounded"
            >

              <span className="truncate">📄 {doc.name}</span>

              <button
                onClick={() => deleteDocument(doc._id)}
                className="text-red-400 text-xs"
              >
                ✕
              </button>

            </div>

          ))}

          <label className="block mt-2 text-blue-400 text-sm cursor-pointer">
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
      <Link
        key={conv.conversationId}
        href={`/conversation/${conv.conversationId}`}
        className={`block px-3 py-2 rounded-lg mb-1 text-sm ${
          active ? "bg-neutral-800" : "hover:bg-neutral-900"
        }`}
      >
        {conv.title || "Untitled"}
      </Link>
    );
  }
}
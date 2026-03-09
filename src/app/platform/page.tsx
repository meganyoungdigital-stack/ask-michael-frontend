"use client";

import Link from "next/link";

export default function AppHome() {
  return (
    <main className="flex h-screen">
      
      {/* Sidebar */}
      <aside className="w-72 border-r p-4">
        <button className="w-full bg-blue-600 text-white py-2 rounded mb-4">
          + New Chat
        </button>

        <p className="text-sm text-gray-500">Pinned</p>
        <p className="text-sm mt-2">[Welding] Potshell Repair ...</p>

        <p className="text-sm text-gray-500 mt-6">All Chats</p>
        <p className="text-sm text-gray-400">No conversations yet</p>
      </aside>

      {/* Main */}
      <section className="flex-1 flex flex-col items-center justify-center">

        <img
          src="/logo.png"
          alt="Ask Michael"
          className="w-40 mb-6"
        />

        <h1 className="text-3xl font-bold">
          Ask <span className="text-blue-600">Michael</span>
        </h1>

        <p className="text-gray-500 mt-2">
          Expert advice on aluminium smelting maintenance
        </p>

        <Link
          href="/portal"
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
        >
          New Chat
        </Link>

      </section>

    </main>
  );
}
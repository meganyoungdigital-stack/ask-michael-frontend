"use client";

import Sidebar from "@/components/Sidebar";

export default function PlatformPage() {

  return (

    <main className="flex h-screen bg-neutral-950 text-white">

      <Sidebar />

      {/* Main Area */}

      <section className="flex-1 flex flex-col items-center justify-center text-center">

        <img
          src="/logo.png"
          alt="Ask Michael"
          className="w-40 mb-6"
        />

        <h1 className="text-4xl font-bold">
          Ask <span className="text-blue-500">Michael</span>
        </h1>

        <p className="text-gray-400 mt-3">
          Expert advice on aluminium smelting maintenance
        </p>

        <p className="text-sm text-gray-500 mt-6">
          Start a new conversation to begin
        </p>

      </section>

    </main>
  );
}
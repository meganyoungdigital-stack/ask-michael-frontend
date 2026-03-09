"use client";

import Sidebar from "@/components/Sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen bg-neutral-950 text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">
        {children}
      </div>

    </main>
  );
}
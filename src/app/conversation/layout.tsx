"use client";

import Sidebar from "@/components/Sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-neutral-950 text-white">

      {/* SIDEBAR */}

      <Sidebar />

      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>

    </main>
  );
}
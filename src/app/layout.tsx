"use client";

import Sidebar from "@/components/Sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">

      {/* SIDEBAR */}

      <Sidebar />

      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>

    </div>
  );
}
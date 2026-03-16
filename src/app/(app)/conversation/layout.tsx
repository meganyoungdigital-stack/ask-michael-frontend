"use client";

import Sidebar from "@/components/Sidebar";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">

      {/* SIDEBAR */}

      <Sidebar />

      {/* CHAT AREA */}

      <div className="flex flex-col flex-1 min-h-0 bg-white">
        {children}
      </div>

    </div>
  );
}
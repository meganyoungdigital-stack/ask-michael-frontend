"use client";

import { useEffect } from "react";

export default function PortalPage() {

  useEffect(() => {
    window.location.href = "/api/conversation/new";
  }, []);

  return (
    <main className="h-screen flex items-center justify-center bg-black text-white">
      <p className="text-gray-400">Loading Ask Michael AI...</p>
    </main>
  );
}
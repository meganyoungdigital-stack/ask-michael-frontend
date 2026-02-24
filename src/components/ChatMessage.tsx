"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon } from "@heroicons/react/24/outline";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isAssistant = role === "assistant";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <div
      className={`flex w-full gap-4 px-4 py-6 ${
        isAssistant ? "bg-[#1a1a1a]" : "bg-black"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isAssistant ? (
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            A
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
            U
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 relative group">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
        >
          <ClipboardIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
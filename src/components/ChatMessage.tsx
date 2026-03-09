"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isTyping = false,
}: ChatMessageProps) {

  const isAssistant = role === "assistant";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`w-full flex px-6 py-4 ${
        isAssistant ? "justify-start bg-gray-50" : "justify-end bg-white"
      }`}
    >
      <div className="relative group max-w-2xl">

        {/* Chat Bubble */}
        <div
          className={`rounded-2xl px-5 py-4 shadow-sm border text-sm leading-relaxed ${
            isAssistant
              ? "bg-white border-gray-200 text-gray-800"
              : "bg-blue-600 text-white border-blue-600"
          }`}
        >

          {isTyping ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-sm max-w-none text-gray-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}

        </div>

        {/* Copy Button */}
        {!isTyping && isAssistant && (
          <button
            onClick={copyToClipboard}
            className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition"
          >
            {copied ? (
              <CheckIcon className="h-5 w-5 text-green-500" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}

      </div>
    </motion.div>
  );
}

/* Typing Indicator */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
    </div>
  );
}
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

  /* ✅ NEW (optional - won't break anything) */
  messageId?: string;
  conversationId?: string;
}

export default function ChatMessage({
  role,
  content,
  isTyping = false,
  messageId,
  conversationId,
}: ChatMessageProps) {

  const isAssistant = role === "assistant";
  const [copied, setCopied] = useState(false);

  /* ================= 👍👎 FEEDBACK STATE ================= */
  const [feedback, setFeedback] = useState<null | "up" | "down">(null);
  const [loading, setLoading] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================= SEND FEEDBACK ================= */
  const sendFeedback = async (type: "up" | "down") => {
    if (!messageId || !conversationId) return;

    try {
      setLoading(true);

      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          messageId,
          rating: type === "up" ? 1 : -1,
        }),
      });

      setFeedback(type);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
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
            <div className="prose prose-sm max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: (props) => (
        <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900" {...props} />
      ),
      h2: (props) => (
        <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-900" {...props} />
      ),
      h3: (props) => (
        <h3 className="text-md font-semibold mt-2 mb-1 text-gray-900" {...props} />
      ),
      p: (props) => (
        <p className="text-sm text-gray-800 leading-relaxed" {...props} />
      ),
      ul: (props) => (
        <ul className="list-disc pl-5 mb-2" {...props} />
      ),
      ol: (props) => (
        <ol className="list-decimal pl-5 mb-2" {...props} />
      ),
      li: (props) => (
        <li className="mb-1" {...props} />
      ),
      strong: (props) => (
        <strong className="font-semibold text-gray-900" {...props} />
      ),
    }}
  >
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

        {/* ================= 👍👎 FEEDBACK UI ================= */}
        {!isTyping && isAssistant && messageId && conversationId && (
          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition">

            <button
              onClick={() => sendFeedback("up")}
              disabled={loading}
              className={`text-sm px-2 py-1 rounded border transition ${
                feedback === "up"
                  ? "bg-green-100 border-green-400 text-green-700"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
            >
              👍
            </button>

            <button
              onClick={() => sendFeedback("down")}
              disabled={loading}
              className={`text-sm px-2 py-1 rounded border transition ${
                feedback === "down"
                  ? "bg-red-100 border-red-400 text-red-700"
                  : "bg-white border-gray-200 hover:bg-gray-100"
              }`}
            >
              👎
            </button>

          </div>
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
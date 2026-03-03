"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import UpgradeModal from "@/components/UpgradeModal";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const { user } = useUser();

  const isPro =
    (user?.publicMetadata as { plan?: string })?.plan === "pro";

  const FREE_LIMIT = 10;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // 🔥 SHARE STATE
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareError, setShareError] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* LOAD CONVERSATION */
  useEffect(() => {
    if (!conversationId) return;

    async function loadConversation() {
      try {
        const res = await fetch(
          `/api/conversation/${conversationId}`
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch {
        setMessages([]);
      }
    }

    loadConversation();
  }, [conversationId]);

  /* ============================
     SEND MESSAGE
  ============================ */

  async function sendMessage() {
    if (!input.trim() || loading || !conversationId) return;

    if (!isPro && messages.length >= FREE_LIMIT) {
      setIsUpgradeOpen(true);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) throw new Error();

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", createdAt: new Date() },
      ]);

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantText += decoder.decode(value, {
          stream: true,
        });

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex].content = assistantText;
          }

          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Something went wrong. Please try again.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ============================
     SHARE FUNCTION
  ============================ */

  async function handleShare() {
    if (!conversationId) return;

    setShareLoading(true);
    setShareError("");

    try {
      const res = await fetch(
        `/api/conversation/${conversationId}/share`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setShareUrl(data.shareUrl);
      setShowShareModal(true);
    } catch {
      setShareError("Failed to generate share link.");
    } finally {
      setShareLoading(false);
    }
  }

  /* ============================
     UI
  ============================ */

  return (
    <>
      <div className="flex flex-col flex-1 bg-white">
        {/* 🔥 HEADER BAR */}
<div className="flex items-center justify-between px-6 py-4 border-b bg-white">
  
  {/* LEFT SIDE – Usage */}
  <div className="flex items-center gap-4">
    {!isPro && (
      <>
        <div className="text-sm text-gray-600">
          {messages.filter(m => m.role === "user").length} / {FREE_LIMIT} Free Messages
        </div>

        <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all"
            style={{
              width: `${Math.min(
                (messages.length / FREE_LIMIT) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </>
    )}

    {isPro && (
      <div className="text-sm text-green-600 font-medium">
        Pro Plan Active
      </div>
    )}
  </div>

  {/* RIGHT SIDE – Buttons */}
  <div className="flex items-center gap-3">
    {!isPro && (
      <button
        onClick={() => setIsUpgradeOpen(true)}
        className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 transition"
      >
        Upgrade
      </button>
    )}

    <button
      onClick={handleShare}
      disabled={shareLoading}
      className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
    >
      {shareLoading ? "Generating..." : "Share"}
    </button>
  </div>
</div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto px-6 py-4"
              >
                <div className="bg-gray-100 rounded-2xl p-4 relative">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(msg.content)
                    }
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="px-6 py-4 text-gray-500">
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t px-6 py-6">
          <div className="flex items-end bg-gray-100 rounded-2xl px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
              className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          {shareError && (
            <p className="text-red-500 mt-2 text-sm">
              {shareError}
            </p>
          )}
        </div>
      </div>

      {/* 🔥 SHARE MODAL */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[420px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              Share this conversation
            </h2>

            <div className="flex gap-2">
              <input
                value={shareUrl}
                readOnly
                className="border px-3 py-2 rounded-xl w-full text-sm"
              />
              <button
                onClick={() =>
                  navigator.clipboard.writeText(shareUrl)
                }
                className="bg-blue-600 text-white px-4 rounded-xl"
              >
                Copy
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-4 text-gray-500 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </>
  );
}
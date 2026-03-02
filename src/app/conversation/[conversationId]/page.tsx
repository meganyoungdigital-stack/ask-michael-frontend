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

  // 🔥 FIX IS HERE
  const conversationId = params?.conversationId as string;

  const { user } = useUser();

  const isPro =
    (user?.publicMetadata as { plan?: string })?.plan === "pro";

  const FREE_LIMIT = 10;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
          `/api/conversations/${conversationId}`
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

  async function sendMessage() {
    console.log("SEND CLICKED"); // Debug log

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

      if (!response.ok) {
        console.error("API failed:", response.status);
        throw new Error("API failed");
      }

      if (!response.body) {
        const text = await response.text();

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: text || "No response from AI.",
            createdAt: new Date(),
          },
        ]);

        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", createdAt: new Date() },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        assistantText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: assistantText,
            };
          }

          return updated;
        });
      }
    } catch (err) {
      console.error("Send error:", err);

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

  const usagePercent = Math.min(
    (messages.length / FREE_LIMIT) * 100,
    100
  );

  return (
    <>
      <div className="flex flex-col flex-1 bg-white">
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
                    className="absolute top-3 right-3 text-gray-400"
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
        </div>
      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </>
  );
}
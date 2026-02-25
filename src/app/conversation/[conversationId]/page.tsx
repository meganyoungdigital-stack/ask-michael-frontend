"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import UpgradeModal from "@/components/UpgradeModal";
import Sidebar from "@/components/Sidebar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* ✅ MUST match Sidebar */
interface Conversation {
  conversationId: string;
  title: string;
}

interface PageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationPage({ params }: PageProps) {
  const { conversationId } = params;
  const { user } = useUser();

  const isPro =
    (user?.publicMetadata as { plan?: string })?.plan === "pro";

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("English");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const FREE_LIMIT = 10;

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Load current conversation */
  useEffect(() => {
    async function loadConversation() {
      try {
        const res = await fetch(
          `/api/conversation?conversationId=${conversationId}`
        );
        const data = await res.json();
        setMessages(data?.messages || []);
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    }

    loadConversation();
  }, [conversationId]);

  /* Load sidebar conversations */
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();

        if (Array.isArray(data)) {
          setConversations(data);
        } else if (Array.isArray(data?.conversations)) {
          setConversations(data.conversations);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    }

    loadConversations();
  }, []);

  async function sendMessage(customMessages?: Message[]) {
    if ((!input.trim() && !customMessages) || loading) return;

    if (!isPro && messages.length >= FREE_LIMIT) {
      setIsUpgradeOpen(true);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages =
      customMessages || [...messages, userMessage];

    if (!customMessages) {
      setMessages(updatedMessages);
      setInput("");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("messages", JSON.stringify(updatedMessages));
      formData.append("tone", tone);
      formData.append("language", language);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await fetch("/api/ask", {
        method: "POST",
        body: formData,
      });

      if (!response.body) {
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = "";

      /* Add assistant placeholder */
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.replace("data: ", "");
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            assistantMessage += parsed.content || "";

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantMessage,
              };
              return updated;
            });
          } catch (err) {
            console.error("Streaming parse error:", err);
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }

    setLoading(false);
    setSelectedFile(null);
  }

  function handleRegenerate() {
    if (messages.length < 2) return;
    const trimmed = messages.slice(0, -1);
    setMessages(trimmed);
    sendMessage(trimmed);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleTextareaChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  const usagePercent =
    (messages.length / FREE_LIMIT) * 100;

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      <Sidebar
        conversations={conversations}
        activeId={conversationId}
      />

      {/* MAIN CHAT */}
      <div className="flex flex-col flex-1 bg-white text-gray-900">

        {/* HEADER */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between">
          <div className="text-sm text-gray-600">
            {isPro ? "Pro Plan" : "Free Plan"}
          </div>

          {!isPro && (
            <button
              onClick={() => setIsUpgradeOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* USAGE BAR */}
        {!isPro && (
          <div className="px-6 py-2">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-blue-600"
              />
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl mx-auto px-6 py-4"
                >
                  <div className="flex gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        isAssistant
                          ? "bg-green-600"
                          : "bg-blue-600"
                      }`}
                    >
                      {isAssistant ? "A" : "U"}
                    </div>

                    <div className="flex-1 bg-gray-100 rounded-2xl p-4 relative">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>

                      <button
                        onClick={() =>
                          copyToClipboard(msg.content)
                        }
                        className="absolute top-3 right-3 text-gray-400"
                      >
                        <ClipboardIcon className="h-5 w-5" />
                      </button>

                      {isAssistant &&
                        index === messages.length - 1 && (
                          <button
                            onClick={handleRegenerate}
                            className="text-xs mt-3 text-gray-500"
                          >
                            Regenerate response
                          </button>
                        )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="px-6 py-4 text-gray-500">
              Ask Michael is thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-gray-200 py-6 px-6 space-y-3">

          <div className="flex gap-3 flex-wrap">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-gray-100 px-3 py-2 rounded-lg text-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="technical">Technical</option>
              <option value="executive">Executive</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-100 px-3 py-2 rounded-lg text-sm"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Zulu</option>
            </select>

            {isPro && (
              <input
                type="file"
                onChange={(e) =>
                  setSelectedFile(e.target.files?.[0] || null)
                }
                className="text-sm"
              />
            )}
          </div>

          <div className="flex items-end bg-gray-100 rounded-2xl px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              placeholder="Message Ask Michael..."
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
              onClick={() => sendMessage()}
              disabled={loading}
              className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Send
            </button>
          </div>
        </div>

        {copySuccess && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-xl">
            Copied to clipboard
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </div>
  );
}
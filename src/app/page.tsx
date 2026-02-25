"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ClipboardIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useUser,
} from "@clerk/nextjs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { user } = useUser();

  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [dailyUsed, setDailyUsed] = useState(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const tier = (user?.publicMetadata?.tier as string) || "free";

  const dailyLimit =
    tier === "enterprise"
      ? "Unlimited"
      : tier === "pro"
      ? 50
      : 10;

  async function sendMessage(customMessages?: Message[]) {
    if ((!input.trim() && !customMessages) || loading) return;

    if (
      dailyLimit !== "Unlimited" &&
      dailyUsed >= dailyLimit
    ) {
      alert("Daily limit reached.");
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
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          conversationId: "temp-id",
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let assistantMessage = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      while (!done) {
        const { value, done: doneReading } =
          await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "");

            if (data === "[DONE]") {
              done = true;
              break;
            }

            const parsed = JSON.parse(data);
            assistantMessage += parsed.content;

            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantMessage,
              };
              return updated;
            });
          }
        }
      }

      setDailyUsed((prev) => prev + 1);
    } catch (error) {
      console.error("Streaming error:", error);
    }

    setLoading(false);
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  /* ---------------- LANDING ---------------- */

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full">

        <h1 className="text-4xl font-bold">
          Ask <span className="text-blue-600">Michael</span>
        </h1>

        <SignedOut>
          <div className="mt-6">
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
                Sign In to Start
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <button
            onClick={() => setStarted(true)}
            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Start Chat
          </button>
        </SignedIn>
      </div>
    );
  }

  /* ---------------- CHAT ---------------- */

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">

        {messages.map((msg, index) => {
          const isAssistant = msg.role === "assistant";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`relative max-w-2xl rounded-2xl px-6 py-4 text-sm shadow-md ${
                  isAssistant
                    ? "bg-white border border-gray-200 text-gray-800"
                    : "bg-blue-600 text-white"
                }`}
              >
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {isAssistant && (
                  <button
                    onClick={() =>
                      copyToClipboard(msg.content, index)
                    }
                    className="absolute -right-8 top-2"
                  >
                    {copiedIndex === index ? (
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ClipboardIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl shadow-md flex gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.4s]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-end bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-md">

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Ask Michael..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm"
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
            className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>

        </div>
      </div>
    </div>
  );
}
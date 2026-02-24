"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
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

  // 🔹 Simulated usage (we will connect real backend later)
  const [dailyUsed, setDailyUsed] = useState(0);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Determine subscription tier from Clerk metadata
  const tier =
    (user?.publicMetadata?.tier as string) || "free";

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

  function handleRegenerate() {
    if (messages.length < 2) return;
    const trimmedMessages = messages.slice(0, -1);
    setMessages(trimmedMessages);
    sendMessage(trimmedMessages);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function handleTextareaChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  // 🟢 LANDING SCREEN WITH AUTH
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white relative">

        {/* User Avatar */}
        <div className="absolute top-6 right-6">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <Image
          src="/m-logo.png"
          alt="Ask Michael Logo"
          width={140}
          height={140}
          priority
        />

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
          Ask <span className="text-blue-600">Michael</span>
        </h1>

        <p className="mt-3 text-gray-500 text-sm">
          AI Engineering Assistant
        </p>

        <SignedOut>
          <div className="mt-8">
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg">
                Sign In to Start
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mt-8 flex flex-col items-center gap-4">

            {/* Subscription Badge */}
            <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {tier.toUpperCase()} PLAN
            </span>

            <button
              onClick={() => setStarted(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
            >
              Start Chat
            </button>
          </div>
        </SignedIn>
      </div>
    );
  }

  // 🟢 CHAT UI
  return (
    <div className="flex flex-col h-full bg-white text-gray-900">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="font-semibold">
          Ask Michael
        </h2>

        <div className="flex items-center gap-4">

          {/* Usage Counter */}
          <div className="text-xs text-gray-500">
            {dailyLimit === "Unlimited"
              ? "Unlimited messages"
              : `${dailyUsed}/${dailyLimit} messages today`}
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === "assistant";

          return (
            <div
              key={index}
              className={`w-full py-6 ${
                isAssistant ? "bg-gray-50" : "bg-white"
              }`}
            >
              <div className="max-w-3xl mx-auto flex gap-4 px-6 group">

                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isAssistant
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isAssistant ? "A" : "U"}
                </div>

                <div className="flex-1 relative">
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(msg.content)
                    }
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-700"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>

                  {isAssistant &&
                    index === messages.length - 1 && (
                      <button
                        onClick={handleRegenerate}
                        className="text-xs text-gray-400 hover:text-gray-700 mt-3"
                      >
                        Regenerate response
                      </button>
                    )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="py-6 max-w-3xl mx-auto px-6 text-gray-400">
            Ask Michael is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-end bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">

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
              className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
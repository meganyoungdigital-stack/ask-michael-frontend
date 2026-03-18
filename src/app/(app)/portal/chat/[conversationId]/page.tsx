"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params?.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ================= FETCH CONVERSATION ================= */
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/conversation/${conversationId}`);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    setSending(true);

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    // optimistic update
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply || "No response",
      };

      // safe append
      setMessages((prev) => [...prev, aiMessage]);

      /* 🔥 LIVE SIDEBAR UPDATE (CORRECT PLACE) */
      window.dispatchEvent(new Event("refreshSidebar"));

    } catch (err) {
      console.error("Send error:", err);

      // fallback message so UI doesn't feel broken
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  /* ================= ENTER TO SEND ================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !sending) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ================= COPY FUNCTION ================= */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return <div className="p-6 text-black bg-white">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white text-black">

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-400">Start a conversation...</p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xl p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* COPY BUTTON (AI ONLY) */}
              {msg.role === "assistant" && (
                <button
                  onClick={() => copyToClipboard(msg.content)}
                  className="text-xs text-gray-500 mt-2 hover:text-black"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        ))}

        {/* AUTO SCROLL TARGET */}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t p-4 flex gap-2">
        <input
          className="flex-1 p-3 rounded border bg-white text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={sending}
          className="bg-blue-600 px-4 py-2 rounded text-white disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
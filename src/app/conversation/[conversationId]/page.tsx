"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PageProps {
  params: {
    conversationId: string;
  };
}

export default function ConversationPage({ params }: PageProps) {
  const { conversationId } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load existing messages
  useEffect(() => {
    async function loadConversation() {
      const res = await fetch(
        `/api/conversation?conversationId=${conversationId}`
      );
      const data = await res.json();
      setMessages(data.messages || []);
    }

    loadConversation();
  }, [conversationId]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        messages: updatedMessages,
      }),
    });

    const data = await res.json();

    const assistantMessage: Message = {
      role: "assistant",
      content: data.reply,
    };

    setMessages([...updatedMessages, assistantMessage]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-3xl ${
              msg.role === "user" ? "ml-auto text-right" : ""
            }`}
          >
            <div
              className={`inline-block px-4 py-3 rounded-xl ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-500">Ask Michael is thinking...</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Ask Michael..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
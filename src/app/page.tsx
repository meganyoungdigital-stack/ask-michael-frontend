"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages: Message[] = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="w-full py-6 border-b border-gray-100"
          >
            <div className="max-w-3xl mx-auto flex gap-4 px-6">

              {/* Avatar */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {msg.role === "user" ? "U" : "A"}
              </div>

              {/* Message Content */}
              <div className="flex-1 whitespace-pre-wrap text-gray-800">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="w-full py-6">
            <div className="max-w-3xl mx-auto px-6 text-gray-500">
              Ask Michael is thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white py-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Ask Michael..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-gray-800"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
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
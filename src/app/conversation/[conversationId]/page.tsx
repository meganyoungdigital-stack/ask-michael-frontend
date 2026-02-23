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

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load existing messages
  useEffect(() => {
    async function loadConversation() {
      try {
        const res = await fetch(
          `/api/conversation?conversationId=${conversationId}`
        );
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to load conversation:", error);
      }
    }

    loadConversation();
  }, [conversationId]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

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
    } catch (error) {
      console.error("Chat error:", error);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-5 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-500 px-5 py-3 rounded-2xl text-sm animate-pulse">
                Ask Michael is thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 shadow-sm">
            
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Ask Michael..."
              className="flex-1 bg-transparent outline-none text-sm"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
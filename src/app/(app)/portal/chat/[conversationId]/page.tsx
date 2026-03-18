"use client";

import { useEffect, useState } from "react";
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

  /* =========================
     FETCH CONVERSATION
  ========================= */
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

  /* =========================
     SEND MESSAGE
  ========================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
  role: "user",
  content: input,
};

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
  const res = await fetch(`/api/chat/${conversationId}`, {
    method: "POST",
    body: JSON.stringify({ message: input }),
  });

  const data = await res.json();

  const aiMessage: Message = {
    role: "assistant",
    content: data.reply,
  };

  setMessages((prev) => [...prev, aiMessage]);

} catch (err) {
  console.error("Send error:", err);
}
  };

  /* =========================
     UI
  ========================= */

  if (loading) {
    return <div className="p-6">Chat interface loading...</div>;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-xl mb-4">
        Conversation {conversationId}
      </h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border rounded p-4 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400">No messages yet</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="mb-3">
            <strong>
              {msg.role === "user" ? "You" : "AI"}:
            </strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 rounded bg-black border"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
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

  /* ✅ USAGE STATE */
  const [usage, setUsage] = useState({
    count: 0,
    limit: 10,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // ✅ NEW FILE STATE

  const remaining = usage.limit - usage.count;
  const isLimitReached = remaining <= 0;

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ================= FETCH USAGE ================= */
  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      const data = await res.json();

      setUsage({
        count: data.count || 0,
        limit: data.limit || 10,
      });
    } catch (err) {
      console.error("Failed to fetch usage");
    }
  };

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
    fetchUsage();
  }, [conversationId]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= FILE HANDLER ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles(Array.from(e.target.files));
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    // ✅ BLOCK IF LIMIT REACHED
    if (!input.trim() || sending || isLimitReached) return;

    setSending(true);

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const formData = new FormData();
      formData.append("message", userMessage.content);

      // ✅ Only allow files for Pro users
      if (usage.limit > 10 && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => formData.append("files", file));
      }

      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.reply || "No response",
      };

      setMessages((prev) => [...prev, aiMessage]);

      setSelectedFiles([]); // ✅ Clear files after sending

      /* 🔥 REFRESH USAGE AFTER MESSAGE */
      await fetchUsage();

      /* 🔥 SIDEBAR UPDATE */
      window.dispatchEvent(new Event("refreshSidebar"));

    } catch (err) {
      console.error("Send error:", err);

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
    if (e.key === "Enter" && !sending && !isLimitReached) {
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

        <div ref={bottomRef} />
      </div>

      {/* INPUT + FILES + USAGE */}
      <div className="border-t p-4 flex flex-col gap-2">

        {/* ✅ FILE INPUT FOR PRO USERS */}
        {usage.limit > 10 && (
          <div className="flex items-center gap-2">
            <input type="file" multiple onChange={handleFileChange} />
            {selectedFiles.length > 0 && (
              <span className="text-xs text-gray-500">
                {selectedFiles.length} file(s) selected
              </span>
            )}
          </div>
        )}

        {/* ✅ USAGE DISPLAY */}
        <p className="text-sm text-gray-500">
          {isLimitReached
            ? "Daily message limit reached"
            : `${remaining} messages left today`}
        </p>

        <div className="flex gap-2">
          <input
            className="flex-1 p-3 rounded border bg-white text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={sending || isLimitReached}
          />
          <button
            onClick={sendMessage}
            disabled={sending || isLimitReached}
            className={`px-4 py-2 rounded text-white ${
              isLimitReached
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600"
            }`}
          >
            {sending ? "..." : isLimitReached ? "Limit Reached" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
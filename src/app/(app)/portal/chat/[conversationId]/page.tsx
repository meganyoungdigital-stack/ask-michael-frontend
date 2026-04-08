"use client";

import ChatMessage from "@/components/ChatMessage";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;

  /* ✅ MULTIPLE FILES */
  files?: {
    name: string;
    url?: string;
  }[];
}

export default function ChatPage() {
  const params = useParams();
  const conversationId = params?.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  /* ================= USAGE ================= */
  const [usage, setUsage] = useState({
    count: 0,
    limit: 10,
  });

  const remaining = usage.limit - usage.count;
  const isLimitReached = remaining <= 0;
  const isPro = usage.limit > 10;

  /* ================= FILE STATE ================= */
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ================= 🔒 FETCH GUARD ================= */
  const isFetchingUsageRef = useRef(false);

  /* ================= FETCH USAGE ================= */
  const fetchUsage = async () => {
    try {
      if (isFetchingUsageRef.current) return; // 🔒 prevent overlapping/stale calls
      isFetchingUsageRef.current = true;

      const res = await fetch("/api/usage");
      const data = await res.json();

      console.log("USAGE RESPONSE:", data);

      /* ✅ HARD SAFE SET (NO FALLBACK CONFUSION) */
      setUsage((prev) => {
        const serverCount =
         typeof data.used === "number" ? data.used : prev.count;
        const serverLimit =
          typeof data.limit === "number" ? data.limit : prev.limit;

        /* 🔥 PREVENT STALE OVERWRITE */
        setUsage({
  count: typeof data.used === "number" ? data.used : 0,
  limit: typeof data.limit === "number" ? data.limit : 10,
});

        return {
          count: serverCount,
          limit: serverLimit,
        };
      });
    } catch (err) {
      console.error("Failed to fetch usage");
    } finally {
      isFetchingUsageRef.current = false;
    }
  };

  /* ================= FETCH CONVERSATION ================= */
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/chat/${conversationId}`);
        if (!res.ok) {
  const text = await res.text();
  console.error("FETCH ERROR:", text);
  throw new Error("Failed to fetch");
}

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

  /* ================= FILE HANDLERS ================= */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setSelectedFiles(Array.from(e.target.files));
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim() || sending || isLimitReached) return;

    setSending(true);

    const userMessage: Message = {
  role: "user",
  content: input.trim(),
  files: selectedFiles.map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file), // optional (for future preview)
  })),
};

    const isFirstMessage = messages.length === 0;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    /* optimistic usage */
    setUsage((prev) => ({
      ...prev,
      count: prev.count + 1,
    }));

    try {
      const formData = new FormData();
      formData.append("message", userMessage.content);

      if (isPro && selectedFiles.length > 0) {
        selectedFiles.forEach((file) =>
          formData.append("files", file)
        );
      }

      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        body: formData,
      });
if (!res.ok) {
  const errorText = await res.text();
  console.error("API ERROR:", errorText);
  throw new Error("API request failed");
}
      if (!res.body) {
  console.error("No response body");
  throw new Error("No response body");
}

      /* ================= STREAMING FIX ================= */
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let aiText = "";

setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

try {
  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    if (value) {
      const chunk = decoder.decode(value);
      aiText += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: aiText,
        };
        return updated;
      });
    }
  }
} catch (streamErr) {
  console.error("STREAM READ ERROR:", streamErr);
}

      setSelectedFiles([]);

      /* ================= TITLE GENERATION ================= */
      if (isFirstMessage) {
        try {
          await fetch("/api/generate-title", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId,
              message: userMessage.content,
            }),
          });

          window.dispatchEvent(new Event("refreshSidebar"));
        } catch (err) {
          console.error("Title generation failed:", err);
        }
      }

      /* ✅ ALWAYS SYNC WITH SERVER */
      await fetchUsage();

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

      /* rollback usage */
      setUsage((prev) => ({
        ...prev,
        count: Math.max(prev.count - 1, 0),
      }));
    } finally {
      setSending(false);
    }
  };

  /* ================= ENTER ================= */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !sending && !isLimitReached) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ================= COPY ================= */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error("Copy failed");
    }
  };

  if (loading) {
    return <div className="p-6 text-black bg-white">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white text-black">

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-400">Start a conversation...</p>
        )}

        {messages.map((msg, i) => (
  <ChatMessage
  key={i}
  role={msg.role}
  content={msg.content}
  conversationId={conversationId}
  files={msg.files}
/>
))}

        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT AREA ================= */}
      <div className="border-t p-4 flex flex-col gap-2">

        {selectedFiles.length > 0 && (
          <div className="text-xs text-gray-500">
            {selectedFiles.map((f, i) => (
              <div key={i}>📄 {f.name}</div>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500">
          {isLimitReached
            ? "Daily message limit reached"
            : `${usage.limit - usage.count} messages left today`}
        </p>

        <div className="flex gap-2 items-end">

          {isPro && (
            <>
              <button
                onClick={openFilePicker}
                className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200"
              >
                📎
              </button>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}

          <textarea
            className="flex-1 p-3 rounded border bg-white text-black resize-none overflow-hidden max-h-40"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            disabled={sending || isLimitReached}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
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
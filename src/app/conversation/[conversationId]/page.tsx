"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon } from "@heroicons/react/24/outline";

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation
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

  async function sendMessage(customMessages?: Message[]) {
    if ((!input.trim() && !customMessages) || loading) return;

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          messages: updatedMessages,
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let assistantMessage = "";

      // Add assistant placeholder
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

  return (
    <div className="flex flex-col h-screen bg-black text-white">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === "assistant";

          return (
            <div
              key={index}
              className={`w-full py-6 ${
                isAssistant ? "bg-[#1a1a1a]" : "bg-black"
              }`}
            >
              <div className="max-w-3xl mx-auto flex gap-4 px-6 group">

                {/* Avatar */}
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isAssistant
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                >
                  {isAssistant ? "A" : "U"}
                </div>

                {/* Content */}
                <div className="flex-1 relative">

                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() =>
                      copyToClipboard(msg.content)
                    }
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>

                  {/* Regenerate Button */}
                  {isAssistant &&
                    index === messages.length - 1 && (
                      <button
                        onClick={handleRegenerate}
                        className="text-xs text-gray-400 hover:text-white mt-3"
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
      <div className="border-t border-gray-800 bg-black py-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-end bg-[#1a1a1a] rounded-2xl px-4 py-3">

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              placeholder="Message Ask Michael..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-white"
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
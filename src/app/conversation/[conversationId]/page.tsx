"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import UpgradeModal from "@/components/UpgradeModal";
import DocumentUpload from "@/components/DocumentUpload";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
}

interface Attachment {
  name: string;
  url: string;
  type: string;
}

export default function ConversationPage() {

  const params = useParams();
  const conversationId = params?.conversationId as string;

  const { user, isLoaded } = useUser();

  const isPro =
    (user?.publicMetadata as { plan?: string })?.plan === "pro";

  const FREE_LIMIT = 10;

  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareError, setShareError] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const userMessageCount = messages.filter(
    (m) => m.role === "user"
  ).length;

  /* AUTO SCROLL */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* LOAD CONVERSATION */

  useEffect(() => {

    if (!conversationId) return;

    async function loadConversation() {

      try {

        const res = await fetch(`/api/conversation/${conversationId}`);

        if (!res.ok) throw new Error("Failed to load");

        const data = await res.json();

        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setAttachments(
          Array.isArray(data?.attachments) ? data.attachments : []
        );

      } catch (err) {

        console.error(err);
        setMessages([]);
        setAttachments([]);

      }
    }

    loadConversation();

  }, [conversationId]);

  /* SEND MESSAGE */

  async function sendMessage() {

    if (!input.trim() || loading || !conversationId) return;

    if (!isPro && userMessageCount >= FREE_LIMIT) {
      setIsUpgradeOpen(true);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {

      const response = await fetch(`/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          messages: updatedMessages,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      while (true) {

        const { done, value } = await reader.read();

        if (done) break;

        assistantText += decoder.decode(value);

        setMessages((prev) => {

          const updated = [...prev];
          updated[updated.length - 1].content = assistantText;

          return updated;

        });

      }

      /* AUTO GENERATE TITLE */

      if (updatedMessages.length === 1) {

        try {

          await fetch("/api/conversation/title", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversationId,
              message: userMessage.content,
            }),
          });

        } catch (err) {

          console.error(err);

        }

      }

    } catch (err) {

      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Please try again.",
        },
      ]);

    } finally {

      setLoading(false);

    }
  }

  /* SHARE */

  async function handleShare() {

    if (!conversationId) return;

    setShareLoading(true);

    try {

      const res = await fetch(
        `/api/conversation/${conversationId}/share`,
        { method: "POST" }
      );

      const data = await res.json();

      setShareUrl(data.shareUrl);
      setShowShareModal(true);

    } catch (err) {

      console.error(err);
      setShareError("Failed to generate share link.");

    }

    setShareLoading(false);

  }

  /* WAIT FOR CLERK */

  if (!isLoaded) {

    return (
      <div className="flex items-center justify-center h-full">
        Loading...
      </div>
    );

  }

  return (

    <>

      <div className="flex flex-col h-screen bg-white">

        {/* HEADER */}

        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">

          <div className="flex items-center gap-4">

            {!isPro && (

              <>

                <div className="text-sm text-gray-600">
                  {userMessageCount} / {FREE_LIMIT} Free Messages
                </div>

                <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${(userMessageCount / FREE_LIMIT) * 100}%`,
                    }}
                  />
                </div>

              </>

            )}

            {isPro && (

              <div className="text-green-600 text-sm font-semibold">
                Pro Plan Active
              </div>

            )}

          </div>

          <div className="flex gap-3">

            {!isPro && (

              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-xl"
              >
                Upgrade
              </button>

            )}

            <button
              onClick={handleShare}
              className="bg-gray-200 px-4 py-2 rounded-xl"
            >
              {shareLoading ? "Generating..." : "Share"}
            </button>

          </div>

        </div>

        {/* CHAT */}

        <div className="flex-1 overflow-y-auto">

          <AnimatePresence>

            {messages.map((msg, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto px-6 py-4"
              >

                <div className="bg-gray-100 text-black rounded-2xl p-4 relative">

                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(msg.content)
                    }
                    className="absolute top-3 right-3 text-gray-400 hover:text-black"
                  >
                    <ClipboardIcon className="h-5 w-5" />
                  </button>

                </div>

              </motion.div>

            ))}

          </AnimatePresence>

          {loading && (
            <div className="px-6 py-4 text-gray-500 max-w-3xl mx-auto">
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />

        </div>

        {/* INPUT */}

        <div className="border-t px-6 py-6 flex-shrink-0">

          <div className="flex items-end bg-gray-100 rounded-2xl px-4 py-3 gap-2 max-w-3xl mx-auto">

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-black"
              onKeyDown={(e) => {

                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }

              }}
            />

            {isPro ? (

              <DocumentUpload conversationId={conversationId} />

            ) : (

              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="text-sm text-gray-500 hover:text-black"
              >
                📄 Upload (Pro)
              </button>

            )}

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Send
            </button>

          </div>

        </div>

      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

    </>
  );
}
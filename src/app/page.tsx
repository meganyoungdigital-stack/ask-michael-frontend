'use client';

import { useState, useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  conversationId: string;
  title?: string;
  updatedAt: string;
  starred?: boolean; // used as "pinned"
}

interface AskResponse {
  success: boolean;
  advice?: string;
  error?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortConversations = (convs: Conversation[]) => {
    return [...convs].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;

      return (
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      );
    });
  };

  const refreshConversations = async () => {
    const res = await fetch('/api/conversation');
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data.conversations)) return;
    setConversations(sortConversations(data.conversations));
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/conversation?conversationId=${conversationId}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch {
        setChatError('Failed to load messages');
        setMessages([]);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const handleNewChat = async () => {
    const res = await fetch('/api/conversation/new', { method: 'POST' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.conversationId) return;
    setConversationId(data.conversationId);
    setMessages([]);
    await refreshConversations();
  };

  const handleRename = async (id: string) => {
    const newTitle = prompt('Enter new name');
    if (!newTitle) return;

    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });

    await refreshConversations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this chat?')) return;

    await fetch(`/api/projects/${id}`, { method: 'DELETE' });

    if (conversationId === id) {
      setConversationId(null);
      setMessages([]);
    }

    await refreshConversations();
  };

  const handleTogglePin = async (id: string) => {
    await fetch(`/api/projects/${id}/star`, { method: 'PATCH' });
    await refreshConversations();
  };

  const isToday = (date: string) =>
    new Date(date).toDateString() === new Date().toDateString();

  const isYesterday = (date: string) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return new Date(date).toDateString() === d.toDateString();
  };

  const filtered = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.starred);
  const today = filtered.filter(
    (c) => !c.starred && isToday(c.updatedAt)
  );
  const yesterday = filtered.filter(
    (c) => !c.starred && isYesterday(c.updatedAt)
  );
  const older = filtered.filter(
    (c) =>
      !c.starred &&
      !isToday(c.updatedAt) &&
      !isYesterday(c.updatedAt)
  );

  const renderItem = (conv: Conversation) => (
    <li
      key={conv.conversationId}
      onClick={() => setConversationId(conv.conversationId)}
      className={`group px-4 py-3 cursor-pointer transition-all duration-200 rounded-md mx-2 ${
        conv.conversationId === conversationId
          ? 'bg-blue-100 dark:bg-blue-900'
          : 'hover:bg-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 truncate">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin(conv.conversationId);
            }}
            className={`transition-all duration-200 ${
              conv.starred
                ? 'text-blue-600 scale-110'
                : 'text-slate-400 hover:text-blue-500'
            }`}
          >
            {conv.starred ? '📌' : '📍'}
          </button>

          <span className="truncate text-sm">
            {conv.title || `Chat (${conv.conversationId.slice(0, 6)})`}
          </span>
        </div>

        <div className="hidden group-hover:flex gap-2 text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRename(conv.conversationId);
            }}
            className="text-blue-500 hover:underline"
          >
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(conv.conversationId);
            }}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );

  return (
    <>
      <SignedIn>
        <div className="flex h-screen">
          <div className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto transition-all">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Chats</span>
                <button
                  onClick={handleNewChat}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  + New
                </button>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="mt-3 w-full rounded-md border px-3 py-2 text-sm dark:bg-slate-800"
              />
            </div>

            <ul className="space-y-1 py-2">
              {pinned.length > 0 && (
                <>
                  <div className="px-4 text-xs font-bold text-blue-600 uppercase">
                    📌 Pinned
                  </div>
                  {pinned.map(renderItem)}
                </>
              )}

              {today.length > 0 && (
                <>
                  <div className="px-4 text-xs font-bold text-slate-500 uppercase">
                    Today
                  </div>
                  {today.map(renderItem)}
                </>
              )}

              {yesterday.length > 0 && (
                <>
                  <div className="px-4 text-xs font-bold text-slate-500 uppercase">
                    Yesterday
                  </div>
                  {yesterday.map(renderItem)}
                </>
              )}

              {older.length > 0 && (
                <>
                  <div className="px-4 text-xs font-bold text-slate-500 uppercase">
                    Older
                  </div>
                  {older.map(renderItem)}
                </>
              )}
            </ul>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <p>{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="border-t p-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="Type message..."
              />
            </form>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

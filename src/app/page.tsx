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
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Fetch conversations list on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setSidebarError(null);
        const res = await fetch('/api/conversation');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.conversations)) {
            // Sort by updatedAt DESC
            const sorted = [...data.conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setConversations(sorted);
            // Auto-select first conversation if none selected
            if (!conversationId && sorted.length > 0) {
              setConversationId(sorted[0].conversationId);
            }
          } else {
            setConversations([]);
          }
        } else {
          setSidebarError('Failed to load conversations');
        }
      } catch (err) {
        setSidebarError('Failed to load conversations');
        console.error('[CONVERSATION_LIST_ERROR]', err);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when conversationId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }
      try {
        setChatError(null);
        const res = await fetch(`/api/conversation?conversationId=${conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        } else {
          setMessages([]);
          setChatError('Failed to load messages');
        }
      } catch (err) {
        setMessages([]);
        setChatError('Failed to load messages');
        console.error('[CONVERSATION_FETCH_ERROR]', err);
      }
    };
    fetchMessages();
  }, [conversationId]);


  // Create new chat
  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/conversation/new', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) {
          setConversationId(data.conversationId);
          setMessages([]);
          // Refresh sidebar
          const convRes = await fetch('/api/conversation');
          if (convRes.ok) {
            const convData = await convRes.json();
            setConversations(Array.isArray(convData.conversations) ? convData.conversations : []);
          }
        }
      }
    } catch (err) {
      console.error('[NEW_CHAT_ERROR]', err);
    }
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setMessages([]);
  };

  // Send message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If no conversationId, create one first
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      try {
        const res = await fetch('/api/conversation/new', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.conversationId) {
            activeConversationId = data.conversationId;
            setConversationId(data.conversationId);
            // Refresh sidebar
            const convRes = await fetch('/api/conversation');
            if (convRes.ok) {
              const convData = await convRes.json();
              setConversations(Array.isArray(convData.conversations) ? convData.conversations : []);
            }
          }
        }
      } catch (err) {
        console.error('[AUTO_NEW_CHAT_ERROR]', err);
      }
    }
    if (!activeConversationId) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId: activeConversationId, messages: updatedMessages }),
      });

      const data: AskResponse = await response.json();

      if (data.success && data.advice) {
        const assistantMessage: Message = { role: 'assistant', content: data.advice };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.error || 'Failed to get advice'}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
      // Refresh sidebar updatedAt
      const convRes = await fetch('/api/conversation');
      if (convRes.ok) {
        const convData = await convRes.json();
        setConversations(Array.isArray(convData.conversations) ? convData.conversations : []);
      }
    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'An error occurred'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SignedOut>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-slate-800">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Ask Michael</h1>
            <p className="mb-6 text-slate-600 dark:text-slate-300">Please sign in to get expert advice on aluminium smelting maintenance.</p>
            <SignInButton mode="modal" />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          {/* Sidebar */}
          <div className="flex flex-col w-[250px] min-w-[200px] max-w-[300px] h-full bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Chats</span>
              <button
                onClick={handleNewChat}
                className="rounded bg-blue-600 text-white px-3 py-1 text-sm font-semibold hover:bg-blue-700 transition-colors"
                title="New Chat"
              >
                + New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarError ? (
                <div className="p-4 text-red-500 text-sm">{sidebarError}</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-slate-500 text-sm">No conversations</div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {conversations.map((conv) => (
                    <li
                      key={conv.conversationId}
                      className={`px-4 py-3 cursor-pointer select-none transition-colors ${
                        conv.conversationId === conversationId
                          ? 'bg-slate-200 dark:bg-slate-800 font-semibold'
                          : 'hover:bg-slate-300 dark:hover:bg-slate-700'
                      }`}
                      onClick={() => handleSelectConversation(conv.conversationId)}
                    >
                      {conv.title || `Chat (${conv.conversationId.slice(0, 6)})`}
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(conv.updatedAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ask Michael</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get advice from Michael&apos;s wisdom</p>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {chatError && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-red-500 text-sm">{chatError}</p>
                  </div>
                )}
                {!chatError && messages.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">Start a conversation with Michael...</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-3 lg:max-w-md xl:max-w-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-slate-200 px-4 py-3 dark:bg-slate-700">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-slate-500 animate-bounce dark:bg-slate-300"></div>
                        <div className="animation-delay-100 h-2 w-2 rounded-full bg-slate-500 animate-bounce dark:bg-slate-300"></div>
                        <div className="animation-delay-200 h-2 w-2 rounded-full bg-slate-500 animate-bounce dark:bg-slate-300"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Form */}
            <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Michael anything..."
                  disabled={loading}
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:disabled:bg-slate-600"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-slate-500"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

"use client";

import { useState } from "react";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  async function askAI() {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setResponse(data.answer);
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Ask Michael AI
        </h1>

        <textarea
          className="w-full p-4 bg-gray-900 border border-gray-700 rounded mb-4"
          rows={4}
          placeholder="Ask an engineering question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          onClick={askAI}
          className="px-6 py-3 bg-blue-600 rounded"
        >
          Ask AI
        </button>

        {response && (
          <div className="mt-8 p-6 bg-gray-900 border border-gray-700 rounded">
            {response}
          </div>
        )}

      </div>
    </main>
  );
}
"use client";

export default function AIKnowledgeEngineering() {
  return (
    <main className="pt-32 text-center text-white px-6">

      <div className="text-left max-w-5xl mx-auto">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = "/";
            }
          }}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Home
        </button>
      </div>

      <h1 className="text-5xl font-bold mt-6">
        AI Knowledge Engineering
      </h1>

    </main>
  );
}
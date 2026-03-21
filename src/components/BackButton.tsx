"use client";

export default function BackButton() {
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/";
        }
      }}
      className="mb-4 text-sm text-blue-400 hover:text-blue-300"
    >
      ← Back to Home
    </button>
  );
}
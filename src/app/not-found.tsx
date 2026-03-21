"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-white bg-black px-6">
      
      <h1 className="text-6xl font-bold mb-4">404</h1>

      <p className="text-lg text-gray-400 mb-8">
        Page not found
      </p>

      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
      >
        Go Home
      </button>

    </main>
  );
}
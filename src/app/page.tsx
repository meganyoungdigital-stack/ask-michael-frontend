"use client";

import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  async function handleNewChat() {
    const res = await fetch("/api/conversation/new", {
      method: "POST",
    });

    const data = await res.json();

    if (data?.conversationId) {
      router.push(`/conversation/${data.conversationId}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      
      {/* Logo with smooth fade-in */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <Image
          src="/m-logo.png"
          alt="Ask Michael"
          width={280}
          height={90}
          priority
          className="object-contain"
        />
      </motion.div>

      {/* Main Heading */}
      <h1 className="text-4xl font-bold">
        Ask <span className="text-blue-600">Michael</span>
      </h1>

      {/* Subtext */}
      <p className="text-gray-600 text-lg max-w-xl mt-4">
        Expert advice on aluminium smelting maintenance
      </p>

      {/* Signed Out Button */}
      <SignedOut>
        <div className="mt-6">
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl">
              Sign In to Start
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* Signed In New Chat Button */}
      <SignedIn>
        <button
          onClick={handleNewChat}
          className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl"
        >
          New Chat
        </button>
      </SignedIn>

    </div>
  );
}
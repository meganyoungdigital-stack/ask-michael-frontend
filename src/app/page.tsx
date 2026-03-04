"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="relative h-screen w-full bg-black text-white overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1026] via-[#111a40] to-black" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl font-bold tracking-wider"
        >
          ASK MICHAEL
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-xl text-gray-300 max-w-2xl"
        >
          Advanced AI built for structured intelligence,
          engineering precision, and scalable insight.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10"
        >
          <Link href="/app">
            <button className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-lg font-semibold hover:scale-105 transition">
              Enter Platform →
            </button>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Navbar() {

  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Hover detection area */}
      <div
        className="fixed top-0 left-0 w-full h-6 z-40"
        onMouseEnter={() => setVisible(true)}
      />

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        onMouseLeave={() => setVisible(false)}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-gray-800"
      >

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-2 text-white text-lg font-semibold">
            <img src="/m-logo.png" className="w-8" />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">

            <Link href="/solutions" className="hover:text-white transition">
              Solutions
            </Link>

            <Link href="/portal" className="hover:text-white transition">
              Platform
            </Link>

            <Link href="/pricing" className="hover:text-white transition">
              Pricing
            </Link>

            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>

          </div>

          {/* Login */}
          <Link href="/portal">
            <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
              Login
            </button>
          </Link>

        </div>

      </motion.nav>
    </>
  );
}
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-blue-950/70 border-b border-blue-900">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white text-lg font-semibold">
          <img src="/m-logo.png" className="w-8" />
          Ask Michael
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

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

    </nav>
  );
}
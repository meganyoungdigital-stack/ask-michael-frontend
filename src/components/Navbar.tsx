"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [isPartnerLoggedIn, setIsPartnerLoggedIn] = useState(false);

  useEffect(() => {
    const checkPartnerLogin = () => {
      const token = localStorage.getItem("partnerToken");

      setIsPartnerLoggedIn(!!token);
    };

    // Check when navbar loads
    checkPartnerLogin();

    // Listen for login event
    window.addEventListener("partnerLogin", checkPartnerLogin);

    // Listen for logout event
    window.addEventListener("partnerLogout", checkPartnerLogin);

    return () => {
      window.removeEventListener("partnerLogin", checkPartnerLogin);
      window.removeEventListener("partnerLogout", checkPartnerLogin);
    };
  }, []);

  const partnerLogout = () => {
    localStorage.removeItem("partnerToken");

    window.dispatchEvent(new Event("partnerLogout"));

    window.location.href = "/partner-login";
  };

  const isPlatform =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/conversation");

  if (!isLoaded) return null;

  // =============================
  // MARKETING NAVBAR
  // =============================
  if (!isPlatform) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-blue-950/70 border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white text-lg font-semibold"
          >
            <img
              src="/m-logo.png"
              className="w-8"
              alt="Michael AI"
            />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

            <Link
              href="/solutions"
              className="hover:text-white transition"
            >
              Solutions
            </Link>

            <Link
              href="/portal"
              className="hover:text-white transition"
            >
              Platform
            </Link>

            <Link
              href="/pricing"
              className="hover:text-white transition"
            >
              Pricing
            </Link>

            <Link
              href="/contact"
              className="hover:text-white transition"
            >
              Contact
            </Link>

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Ask Michael Login */}
            {!isSignedIn && (
              <Link href="/portal">
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
                  Login
                </button>
              </Link>
            )}

            {/* Partner Login / Account */}
            {isPartnerLoggedIn ? (
              <>
                <Link href="/partner-dashboard">
                  <button className="px-5 py-2 rounded-full bg-green-600 text-white text-sm hover:scale-105 transition">
                    Partner Account
                  </button>
                </Link>

                <button
                  onClick={partnerLogout}
                  className="px-4 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/partner-login">
                <button className="px-5 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition">
                  Partner Login
                </button>
              </Link>
            )}

            {/* Clerk Account */}
            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            )}

          </div>
        </div>
      </nav>
    );
  }

  // =============================
  // PLATFORM NAVBAR
  // =============================
  return (
    <div
      className="fixed top-0 left-0 w-full z-50"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div className="h-4 w-full" />

      <nav
        className={`transition-all duration-300 overflow-visible backdrop-blur-md bg-blue-950/90 border-b border-blue-900 ${
          visible ? "h-[72px] opacity-100" : "h-0 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white text-lg font-semibold"
          >
            <img
              src="/m-logo.png"
              className="w-8"
              alt="Michael AI"
            />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

            <Link
              href="/solutions"
              className="hover:text-white transition"
            >
              Solutions
            </Link>

            <Link
              href="/portal"
              className="hover:text-white transition"
            >
              Platform
            </Link>

            <Link
              href="/pricing"
              className="hover:text-white transition"
            >
              Pricing
            </Link>

            <Link
              href="/contact"
              className="hover:text-white transition"
            >
              Contact
            </Link>

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Ask Michael Login */}
            {!isSignedIn && (
              <Link href="/portal">
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
                  Login
                </button>
              </Link>
            )}

            {/* Partner Login / Account */}
            {isPartnerLoggedIn ? (
              <>
                <Link href="/partner-dashboard">
                  <button className="px-5 py-2 rounded-full bg-green-600 text-white text-sm hover:scale-105 transition">
                    Partner Account
                  </button>
                </Link>

                <button
                  onClick={partnerLogout}
                  className="px-4 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/partner-login">
                <button className="px-5 py-2 rounded-full border border-white/30 text-white text-sm hover:bg-white/10 transition">
                  Partner Login
                </button>
              </Link>
            )}

            {/* Clerk Account */}
            {isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            )}

          </div>
        </div>
      </nav>
    </div>
  );
}
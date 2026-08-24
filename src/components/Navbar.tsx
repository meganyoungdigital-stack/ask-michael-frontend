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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkPartnerLogin = () => {
      const token = localStorage.getItem("partnerToken");

      setIsPartnerLoggedIn(!!token);
    };

    checkPartnerLogin();

    window.addEventListener("partnerLogin", checkPartnerLogin);
    window.addEventListener("partnerLogout", checkPartnerLogin);

    return () => {
      window.removeEventListener("partnerLogin", checkPartnerLogin);
      window.removeEventListener("partnerLogout", checkPartnerLogin);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
  // SHARED NAVIGATION LINKS
  // =============================

  const NavigationLinks = () => (
    <>
      <Link
        href="/solutions"
        className="hover:text-white transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Solutions
      </Link>

      <Link
        href="/portal"
        className="hover:text-white transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Platform
      </Link>

      <Link
        href="/pricing"
        className="hover:text-white transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Pricing
      </Link>

      <Link
        href="/contact"
        className="hover:text-white transition"
        onClick={() => setMobileMenuOpen(false)}
      >
        Contact
      </Link>
    </>
  );

  // =============================
  // MOBILE MENU
  // =============================

  const MobileMenu = () => (
    <div className="md:hidden border-t border-blue-900 bg-blue-950/95 px-5 py-5">

      <div className="flex flex-col gap-4 text-blue-100 text-base">

        <NavigationLinks />

      </div>

      <div className="mt-5 pt-5 border-t border-blue-900 flex flex-col gap-3">

        {!isSignedIn && (
          <Link
            href="/portal"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full"
          >
            <button className="w-full px-5 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
              Login
            </button>
          </Link>
        )}

        {isPartnerLoggedIn ? (
          <>
            <Link
              href="/partner-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <button className="w-full px-5 py-3 rounded-full bg-green-600 text-white text-sm">
                Partner Account
              </button>
            </Link>

            <button
              onClick={partnerLogout}
              className="w-full px-5 py-3 rounded-full border border-white/30 text-white text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/partner-login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full"
          >
            <button className="w-full px-5 py-3 rounded-full border border-white/30 text-white text-sm"
            >
              Partner Login
            </button>
          </Link>
        )}

        {isSignedIn && (
          <div className="flex justify-center pt-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        )}

      </div>
    </div>
  );

  // =============================
  // MARKETING NAVBAR
  // =============================

  if (!isPlatform) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-blue-950/70 border-b border-blue-900">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold"
          >
            <img
              src="/m-logo.png"
              className="w-7 sm:w-8"
              alt="Michael AI"
            />

            <span>Ask Michael</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">
            <NavigationLinks />
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">

            {!isSignedIn && (
              <Link href="/portal">
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
                  Login
                </button>
              </Link>
            )}

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

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
          >
            <span className="text-xl">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <MobileMenu />}

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
          visible ? "h-auto min-h-[72px] opacity-100" : "h-0 opacity-0"
        }`}
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold"
          >
            <img
              src="/m-logo.png"
              className="w-7 sm:w-8"
              alt="Michael AI"
            />

            <span>Ask Michael</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">
            <NavigationLinks />
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">

            {!isSignedIn && (
              <Link href="/portal">
                <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
                  Login
                </button>
              </Link>
            )}

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

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
          >
            <span className="text-xl">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && <MobileMenu />}

      </nav>

    </div>
  );
}
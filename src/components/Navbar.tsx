"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const lang = useLanguage();
const t = translations[lang as "en" | "zu" | "af" | "fr"];
  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState<string>(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lang") || "en";
  }
  return "en";
});

    const changeLanguage = (lang: string) => {
  setLanguage(lang);

  if (typeof window !== "undefined") {
    localStorage.setItem("lang", lang);
    window.dispatchEvent(new Event("languageChange"));
  }
};
  // Detect platform routes
  const isPlatform =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/conversation");

  // Prevent rendering before Clerk loads
  if (!isLoaded) {
    return null;
  }

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
            <img src="/m-logo.png" className="w-8" alt="Michael AI" />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

            {/* 🌍 LANGUAGE SWITCHER (UPDATED) */}
            <div className="flex items-center gap-1 border border-white/20 rounded-lg px-1 py-1">
              {["en", "zu", "af", "fr"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-2 py-1 rounded ${
                    language === lang ? "bg-white text-black" : "text-white"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <Link href="/solutions" className="hover:text-white transition">
  {t.footerSolutions}
</Link>

<Link href="/portal" className="hover:text-white transition">
  {t.footerPlatform}
</Link>

<Link href="/pricing" className="hover:text-white transition">
  {t.footerPricing}
</Link>

<Link href="/contact" className="hover:text-white transition">
  {t.footerContact}
</Link>
          </div>

          {/* Right Side */}
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          ) : (
            <Link href="/portal">
             <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
              {t.login}
             </button>
            </Link>
          )}
        </div>
      </nav>
    );
  }

  // =============================
  // PLATFORM NAVBAR (HOVER MODE)
  // =============================
  return (
    <div
      className="fixed top-0 left-0 w-full z-50"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {/* Invisible hover trigger */}
      <div className="h-4 w-full" />

      {/* Dropdown Navbar */}
      <nav
        className={`transition-all duration-300 overflow-hidden backdrop-blur-md bg-blue-950/90 border-b border-blue-900 ${
          visible ? "h-[72px] opacity-100" : "h-0 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white text-lg font-semibold"
          >
            <img src="/m-logo.png" className="w-8" alt="Michael AI" />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

            {/* 🌍 LANGUAGE SWITCHER (UPDATED) */}
            <div className="flex items-center gap-1 border border-white/20 rounded-lg px-1 py-1">
              {["en", "zu", "af", "fr"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-2 py-1 rounded ${
                    language === lang ? "bg-white text-black" : "text-white"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <Link href="/solutions" className="hover:text-white transition">
  {t.footerSolutions}
</Link>

<Link href="/portal" className="hover:text-white transition">
  {t.footerPlatform}
</Link>

<Link href="/pricing" className="hover:text-white transition">
  {t.footerPricing}
</Link>

<Link href="/contact" className="hover:text-white transition">
  {t.footerContact}
</Link>
          </div>

          {/* Right Side */}
          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          ) : (
            <Link href="/portal">
             <button className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm hover:scale-105 transition">
              {t.login}
             </button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
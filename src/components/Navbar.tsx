"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const lang = useLanguage();
  const t = translations[lang as "en" | "zu" | "af" | "fr"];

  const { isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false); // navbar hover
  const [langOpen, setLangOpen] = useState(false); // dropdown

  const language = lang; // ✅ single source of truth

  const changeLanguage = (lang: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
      window.dispatchEvent(new Event("languageChange"));
      window.location.reload(); // ensures UI updates
    }
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
          <Link href="/" className="flex items-center gap-2 text-white text-lg font-semibold">
            <img src="/m-logo.png" className="w-8" alt="Michael AI" />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

            {/* 🌍 LANGUAGE DROPDOWN */}
            <div className="relative" onMouseLeave={() => setLangOpen(false)}>
              <button
                onClick={() => setLangOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-1 text-white hover:bg-white/10 transition"
              >
                <span>
                  {language === "en" && "🇬🇧"}
                  {language === "af" && "🇿🇦"}
                  {language === "zu" && "🇿🇦"}
                  {language === "fr" && "🇫🇷"}
                </span>
                <span className="text-sm font-medium">
                  {language.toUpperCase()}
                </span>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-blue-950 shadow-lg z-50">
                  {[
                    { code: "en", name: "English", flag: "🇬🇧" },
                    { code: "af", name: "Afrikaans", flag: "🇿🇦" },
                    { code: "zu", name: "Zulu", flag: "🇿🇦" },
                    { code: "fr", name: "Français", flag: "🇫🇷" },
                  ].map((langOption) => (
                    <button
                      key={langOption.code}
                      onClick={() => {
                        changeLanguage(langOption.code);
                        setLangOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition"
                    >
                      <span>{langOption.flag}</span>
                      <span>{langOption.name}</span>
                      <span className="ml-auto text-xs opacity-60">
                        {langOption.code.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
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
        className={`transition-all duration-300 overflow-hidden backdrop-blur-md bg-blue-950/90 border-b border-blue-900 ${
          visible ? "h-[72px] opacity-100" : "h-0 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white text-lg font-semibold">
            <img src="/m-logo.png" className="w-8" alt="Michael AI" />
            Ask Michael
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm text-blue-100">

            {/* 🌍 LANGUAGE DROPDOWN */}
            <div className="relative" onMouseLeave={() => setLangOpen(false)}>
              <button
                onClick={() => setLangOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-white/20 rounded-lg px-3 py-1 text-white hover:bg-white/10 transition"
              >
                <span>
                  {language === "en" && "🇬🇧"}
                  {language === "af" && "🇿🇦"}
                  {language === "zu" && "🇿🇦"}
                  {language === "fr" && "🇫🇷"}
                </span>
                <span className="text-sm font-medium">
                  {language.toUpperCase()}
                </span>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-blue-950 shadow-lg z-50">
                  {[
                    { code: "en", name: "English", flag: "🇬🇧" },
                    { code: "af", name: "Afrikaans", flag: "🇿🇦" },
                    { code: "zu", name: "Zulu", flag: "🇿🇦" },
                    { code: "fr", name: "Français", flag: "🇫🇷" },
                  ].map((langOption) => (
                    <button
                      key={langOption.code}
                      onClick={() => {
                        changeLanguage(langOption.code);
                        setLangOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-white hover:bg-white/10 transition"
                    >
                      <span>{langOption.flag}</span>
                      <span>{langOption.name}</span>
                      <span className="ml-auto text-xs opacity-60">
                        {langOption.code.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
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
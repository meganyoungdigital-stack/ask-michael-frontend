"use client";

import { useEffect, useState } from "react";

export function useLanguage() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLang = () => {
      const savedLang = localStorage.getItem("lang") || "en";
      setLang(savedLang);
    };

    loadLang();

    window.addEventListener("languageChange", loadLang);

    return () => {
      window.removeEventListener("languageChange", loadLang);
    };
  }, []);

  return lang;
}
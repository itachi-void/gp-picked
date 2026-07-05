"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, apiTranslations } from "@/data/translations";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  dir: "ltr" | "rtl";
  t: (key: string, fallback?: string) => string;
  tApi: (val: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language | null;
      if (saved === "ar" || saved === "en") {
        setLanguageState(saved);
        document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = saved;
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  }, [mounted, language]);

  const dir: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";

  // Translate static dictionary keys
  const t = (path: string, fallback?: string): string => {
    if (!mounted) return fallback || path;

    const keys = path.split(".");
    let current: any = (translations as any)[language] || translations.en;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fall back to English dictionary lookup if Arabic key is missing
        let enFallback: any = translations.en;
        for (const k of keys) {
          if (enFallback && typeof enFallback === "object" && k in enFallback) {
            enFallback = enFallback[k];
          } else {
            enFallback = undefined;
            break;
          }
        }
        return enFallback !== undefined ? enFallback : (fallback !== undefined ? fallback : path);
      }
    }

    return typeof current === "string" ? current : (fallback !== undefined ? fallback : path);
  };

  // Translate dynamic API strings/states
  const tApi = (val: string): string => {
    if (language === "en" || !val) return val;
    const cleanKey = val.toLowerCase().trim();
    return apiTranslations[cleanKey] || val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, dir, t, tApi }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

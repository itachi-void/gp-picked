"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const handleToggle = () => {
    const nextLang = language === "en" ? "ar" : "en";
    setLanguage(nextLang);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md shadow-sm hover:shadow transition-all duration-300 hover:scale-[1.04] active:scale-95 group text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
      title={language === "en" ? "Switch to Arabic" : "التغيير للغة الإنجليزية"}
    >
      <Globe className="w-4 h-4 text-emerald-500 group-hover:rotate-12 transition-transform duration-300" />
      <span>{language === "en" ? "العربية" : "English"}</span>
    </button>
  );
}

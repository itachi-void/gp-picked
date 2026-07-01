"use client";

import { useState } from "react";
import { Globe2 } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";
import { toast } from "sonner";

export function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "ar">("en");

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ar" : "en";
    setLang(nextLang);
    toast.info(nextLang === "ar" ? "تم تغيير اللغة إلى العربية" : "Language switched to English");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="relative group rounded-full cursor-pointer h-9 w-9"
      title={lang === "en" ? "Switch to Arabic" : "تغيير إلى الإنجليزية"}
    >
      <Globe2 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-sm px-0.5 scale-75 font-black uppercase">
        {lang}
      </span>
    </Button>
  );
}

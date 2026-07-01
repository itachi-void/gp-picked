"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRoleTabs } from "@/hooks/useRoleTabs";
import { MoreDropdown } from "./MoreDropdown";

export function DesktopNav() {
  const [mounted, setMounted] = useState(false);
  const { tabs } = useRoleTabs();
  const pathname = usePathname();

  // منع مشاكل الـ Hydration بسبب اختلاف الأدوار بين السيرفر والعميل
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // عرض هيكل تحميل مؤقت متطابق لتجنب تضارب المحتوى
    return <div className="hidden md:flex items-center gap-1 p-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-48 animate-pulse" />;
  }

  // ========== لو مفيش تبويبات، متظهرش القائمة ==========
  if (tabs.length === 0) return null;

  return (
    <nav className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
      {/* عرض التبويبات */}
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.to);
        
        return (
          <Link
            key={tab.to}
            href={tab.to}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-colors ${
              isActive
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </Link>
        );
      })}

      {/* زرار More */}
      <MoreDropdown />
    </nav>
  );
}
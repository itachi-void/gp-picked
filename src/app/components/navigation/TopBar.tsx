"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { LanguageToggle } from "./LanguageToggle";
import { NotificationBell } from "./NotificationBell";
import { GlobalSearch } from "./GlobalSearch";
import { TopBarStats } from "./TopBarStats";

export default function TopBar() {
  // ========== ١. جلب الثيم ==========
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 dark:bg-gray-950/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* ========== ٢. الشعار + القائمة ========== */}
        <div className="flex items-center gap-6">
          <Logo />
          <DesktopNav />
        </div>

        {/* ========== إحصائيات سريعة في المنتصف ========== */}
        <TopBarStats />

        {/* ========== البحث العالمي ========== */}
        <GlobalSearch />

        {/* ========== ٣. الأزرار اليمين ========== */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <NotificationBell />
          
          {/* زر الوضع الليلي */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <UserMenu />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
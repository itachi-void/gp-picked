"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useRoleTabs } from "@/hooks/useRoleTabs";
import { moreGroups } from "@/data/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const routeToKey: Record<string, string> = {
  "/centers": "nav.centers",
  "/centers-list": "nav.centersList",
  "/communities": "nav.communities",
  "/partners": "nav.partners",
  "/schedule": "nav.schedule",
  "/verification": "nav.verification",
  "/logistics": "nav.logistics",
  "/analytics": "nav.analytics",
  "/alerts": "nav.alerts",
  "/performance": "nav.performance",
  "/reports": "nav.reports",
  "/sustainability": "nav.sustainability",
  "/citizen-levels": "nav.levels",
  "/badges": "nav.badges",
  "/leaderboards": "nav.leaderboards",
  "/rewards": "nav.rewards",
  "/citizen-stats": "nav.citizenStats",
  "/users": "nav.users",
  "/resources": "nav.resources",
  "/ai-validation": "nav.aiValidation",
  "/activity-log": "nav.activityLog",
  "/permissions": "nav.permissions",
  "/audit": "nav.audit",
  "/support": "nav.support",
  "/drivers": "nav.drivers",
  "/fleet": "nav.fleet",
  "/routes": "nav.routes",
  "/pickups": "nav.pickups",
  "/overview": "nav.overview",
  "/driver-portal": "nav.home",
  "/citizen-portal": "nav.home",
  "/employee-history": "nav.history",
  "/employee-profile": "nav.profile",
};

export function MobileNav() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { tabs, role } = useRoleTabs();
  const { t, language } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="md:hidden w-9 h-9 rounded-full flex items-center justify-center bg-gray-150 animate-pulse">
        <Menu className="h-5 w-5 opacity-30" />
      </button>
    );
  }

  // ========== فلترة القوائم حسب الرول ==========
  const visibleGroups = moreGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* زرار فتح القائمة */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* القائمة الجانبية */}
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* خلفية شفافة */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* القائمة */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-950 shadow-2xl overflow-y-auto transition-transform duration-300">
            {/* رأس القائمة */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold">Menu</span>
              <button onClick={() => setOpen(false)} className="cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* التبويبات الرئيسية */}
            <div className="p-4 space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.to}
                  href={tab.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    pathname.startsWith(tab.to)
                      ? "bg-black/10 dark:bg-white/10 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              ))}

              {/* القوائم الإضافية */}
              {visibleGroups.map((group) => (
                <div key={group.title} className="pt-3 border-t border-gray-100 dark:border-gray-900 mt-3">
                  <div className="text-[10px] font-bold uppercase text-gray-400 px-3 pb-1">
                    {t("nav." + group.title.toLowerCase(), group.title)}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        href={item.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {item.icon && <item.icon className="h-4 w-4 text-gray-500 shrink-0" />}
                        <span className="truncate">{t(routeToKey[item.to], item.label)}</span>
                        {item.comingSoon && (
                          <span className="ml-auto px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 whitespace-nowrap">
                            Coming Soon
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
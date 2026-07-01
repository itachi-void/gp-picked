"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRoleTabs } from "@/hooks/useRoleTabs";
import { moreGroups } from "@/data/navigation";

export function MoreDropdown() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { role } = useRoleTabs();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ========== إغلاق القائمة بالنقر بره ==========
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!mounted) {
    return (
      <button className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-full text-gray-400 focus:outline-none opacity-50">
        More
        <ChevronDown className="h-3 w-3" />
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

  if (visibleGroups.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* الزرار */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-full text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer focus:outline-none"
      >
        More
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* القائمة المنسدلة */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[550px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 grid grid-cols-3 gap-4 z-50">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {item.icon && <item.icon className="h-3.5 w-3.5 text-gray-500 group-hover:text-gray-900" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
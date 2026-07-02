"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import { useRoleTabs } from "@/hooks/useRoleTabs";
import { moreGroups } from "@/data/navigation";
import { useAuth } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function MoreDropdown() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { role } = useRoleTabs();
  const { logout } = useAuth();
  const router = useRouter();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 720 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter groups by role
  const visibleGroups = moreGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideButton = buttonRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideButton && !insideMenu) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Track position dynamically relative to viewport
  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const cols = Math.min(visibleGroups.length, 3) || 1;
      const width = Math.min(cols * 240, window.innerWidth - 16);
      
      let left = rect.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      
      setMenuPos({
        top: rect.bottom + window.scrollY + 8,
        left: left + window.scrollX,
        width,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, visibleGroups.length]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.replace("/login");
  };

  if (!mounted || visibleGroups.length === 0) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer focus:outline-none ${
          open
            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
            : "text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
        }`}
      >
        More
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden z-[200] p-5 mc-scale-in"
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
              Operations & Control
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-emerald-600 dark:text-emerald-400">
              EcoSnap
            </span>
          </div>

          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: `repeat(${Math.min(visibleGroups.length, 3)}, minmax(0, 1fr))` }}
          >
            {visibleGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-emerald-600 dark:text-emerald-400">
                  {group.title}
                </div>
                <div className="flex flex-col gap-1">
                  {group.items.map((m) => (
                    <Link
                      key={m.to}
                      href={m.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    >
                      {m.icon && <m.icon className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />}
                      <span className="font-semibold truncate">{m.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
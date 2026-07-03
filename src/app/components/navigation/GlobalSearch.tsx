"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Map, 
  Package, 
  Route as RouteIcon, 
  HelpCircle, 
  TrendingUp, 
  Activity, 
  Globe,
  Settings
} from "lucide-react";

interface SearchItem {
  title: string;
  description: string;
  path: string;
  icon: any;
  category: "Pages" | "Utilities";
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    title: "Overview Dashboard",
    description: "View waste statistics, KPIs and active metrics",
    path: "/overview",
    icon: Activity,
    category: "Pages",
  },
  {
    title: "Live Operations Map",
    description: "Real-time fleet tracking and driver tracking",
    path: "/fleet",
    icon: Map,
    category: "Pages",
  },
  {
    title: "Manage Pickups",
    description: "Assign, accept and verify citizen pickups",
    path: "/pickups",
    icon: Package,
    category: "Pages",
  },
  {
    title: "Active Fleet Routes",
    description: "View and optimize delivery & collection routes",
    path: "/routes",
    icon: RouteIcon,
    category: "Pages",
  },
  {
    title: "Support Tickets",
    description: "Manage system feedback and citizen reports",
    path: "/support",
    icon: HelpCircle,
    category: "Pages",
  },
  {
    title: "Performance Metrics",
    description: "Analyze recycler efficiency and trip durations",
    path: "/performance",
    icon: TrendingUp,
    category: "Utilities",
  },
  {
    title: "System Settings",
    description: "Configure profile and global system defaults",
    path: "/permissions",
    icon: Settings,
    category: "Utilities",
  },
];

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [latency, setLatency] = useState(12);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mock a slight variation in API latency for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const next = prev + diff;
        return next < 8 ? 8 : next > 25 ? 18 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = SEARCH_ITEMS.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapperRef} className="hidden md:flex items-center flex-1 max-w-sm mx-8 relative z-50">
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/40 pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search dashboard or quick shortcuts..."
          className="w-full pl-10 pr-12 py-1.5 text-xs rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-500/20 focus:border-emerald-500/80 dark:focus:border-emerald-500/60 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-1.5 font-mono text-[9px] font-medium text-slate-400 dark:text-white/30 shadow-sm pointer-events-none">
          <span>⌘</span>K
        </kbd>
      </div>

      {/* Search dropdown overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-950/95 border border-slate-200/70 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[420px] flex flex-col">
          {/* Header info */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-400 dark:text-white/30 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Waste Network Active
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> API Latency: <span className="font-semibold text-emerald-500">{latency}ms</span>
            </span>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {filteredItems.length > 0 ? (
              <>
                {/* Pages Category */}
                {filteredItems.some(i => i.category === "Pages") && (
                  <div className="mb-2">
                    <div className="px-4 py-1 text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-wider">
                      Pages & Operations
                    </div>
                    {filteredItems
                      .filter(i => i.category === "Pages")
                      .map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelect(item.path)}
                          className="w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] text-left flex items-start gap-3 transition-colors group"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                {/* Utilities Category */}
                {filteredItems.some(i => i.category === "Utilities") && (
                  <div>
                    <div className="px-4 py-1 text-[9px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-wider">
                      Utilities & Settings
                    </div>
                    {filteredItems
                      .filter(i => i.category === "Utilities")
                      .map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelect(item.path)}
                          className="w-full px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.03] text-left flex items-start gap-3 transition-colors group"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-white/30">
                No shortcuts found matching "{query}"
              </div>
            )}
          </div>
          
          {/* Footer keyboard helpers */}
          <div className="px-4 py-1.5 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5 text-[9px] text-slate-400 dark:text-white/30 flex items-center justify-between">
            <span>Use search keywords for fast filters</span>
            <span>ESC to dismiss</span>
          </div>
        </div>
      )}
    </div>
  );
}

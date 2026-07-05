"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { MapPin, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";

// 1. البيانات
const zonesData = [
  { id: "Z-IB", name: "Industrial B", city: "Cairo", collected: 76, target: 50, drivers: 4, pending: 1 },
  { id: "Z-SH", name: "Shubra", city: "Cairo", collected: 55, target: 45, drivers: 3, pending: 2 },
  { id: "Z-DT", name: "Downtown", city: "Cairo", collected: 48, target: 20, drivers: 3, pending: 2 },
  { id: "Z-HK", name: "Heliopolis", city: "Cairo", collected: 41, target: 40, drivers: 2, pending: 3 },
  { id: "Z-GC", name: "Garden City", city: "Cairo", collected: 32, target: 35, drivers: 2, pending: 4 },
  { id: "Z-OB", name: "October Bridge", city: "Giza", collected: 29, target: 35, drivers: 2, pending: 5 },
  { id: "Z-MD", name: "Maadi", city: "Cairo", collected: 23, target: 30, drivers: 1, pending: 7 },
  { id: "Z-ZM", name: "Zamalek", city: "Cairo", collected: 18, target: 25, drivers: 1, pending: 8 },
];

// 2. دالة التنسيق - سمينا المتغير achievementRate ليكون واضحاً لمهمته
const getZoneStyles = (achievementRate: number, isDark: boolean) => {
  if (achievementRate >= 20) return { 
    bg: isDark ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600", 
    bar: "bg-emerald-500", 
    Icon: TrendingUp 
  };
  if (achievementRate >= 5)  return { 
    bg: isDark ? "bg-green-950/20 border-green-500/20 text-green-400" : "bg-green-50 border-green-100 text-green-600", 
    bar: "bg-green-500", 
    Icon: TrendingUp 
  };
  if (achievementRate >= -5) return { 
    bg: isDark ? "bg-blue-950/20 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600", 
    bar: "bg-blue-500", 
    Icon: Minus 
  };
  if (achievementRate >= -20)return { 
    bg: isDark ? "bg-amber-950/20 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-100 text-amber-600", 
    bar: "bg-amber-500", 
    Icon: TrendingDown 
  };
  return { 
    bg: isDark ? "bg-red-950/20 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-600", 
    bar: "bg-red-500", 
    Icon: AlertCircle 
  };
};

export default function ZoneHeatmap() {
  const [sortBy, setSortBy] = useState("Performance");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // 3. منطق الترتيب
  const sortedZones = [...zonesData].sort((a, b) => {
    if (sortBy === "Collections") return b.collected - a.collected;
    if (sortBy === "Pending") return b.pending - a.pending;
    // الترتيب الافتراضي حسب نسبة الإنجاز
    return ((b.collected - b.target) / b.target) - ((a.collected - a.target) / a.target);
  });

  return (
    <div className="p-6 text-black dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/10"><MapPin size={20} /></div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Zone Performance</h2>
            <p className="text-sm text-gray-400 dark:text-white/40">Monitoring 8 total zones across Cairo and Giza</p>
          </div>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-[#1C1E22] p-1 rounded-2xl transition-colors duration-300">
          {["Performance", "Collections", "Pending"].map(btn => (
            <button 
              key={btn} 
              onClick={() => setSortBy(btn)} 
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${sortBy === btn ? "bg-white dark:bg-[#262B32] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-white/40"}`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sortedZones.map((zone) => {
          // حساب نسبة الإنجاز
          const achievementRate = Math.round(((zone.collected - zone.target) / zone.target) * 100);
          const s = getZoneStyles(achievementRate, isDark);

          return (
            <div key={zone.id} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${s.bg}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight tracking-tight">{zone.name}</h3>
                  <p className="text-gray-500 dark:text-white/40 text-sm">{zone.city}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold text-sm`}>
                  <s.Icon size={14} /> {achievementRate > 0 ? "+" : ""}{achievementRate}%
                </div>
              </div>

              <div className="flex justify-between text-[13px] text-gray-600 dark:text-white/60 mb-2 font-medium">
                <span>{zone.collected} collected</span>
                <span>Target: {zone.target}</span>
              </div>
              
              <div className="h-2 w-full bg-white/60 dark:bg-black/20 rounded-full overflow-hidden mb-5">
                <div className={`h-full ${s.bar}`} style={{ width: `${Math.min(100, (zone.collected/zone.target)*100)}%` }} />
              </div>

              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="bg-white/80 dark:bg-black/25 px-2 py-1 rounded-lg text-gray-700 dark:text-white/80 uppercase tracking-tighter">🚚 {zone.drivers} drivers</span>
                <span className={`bg-white/80 dark:bg-black/25 px-2 py-1 rounded-lg uppercase tracking-tighter ${zone.pending > 5 ? "bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-500/20" : "text-gray-700 dark:text-white/80"}`}>
                   {zone.pending > 5 ? "⚠" : "📋"} {zone.pending} pending
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-medium text-gray-400 dark:text-white/40 pt-4 border-t border-gray-50 dark:border-white/5 transition-colors duration-300">
        <span>Performance Scale:</span>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Exceeding</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> On Track</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> Stable</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> Behind</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Critical</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, startTransition } from "react";
import { useRouter } from "@/shims/next-navigation";
import { useTheme } from "next-themes";
import dynamic from "@/shims/next-dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Users,
  MapPin,
  Target,
  Activity,
  Award,
  Leaf,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  TrendingUp,
  DollarSign,
  Sparkles,
  Truck,
  Phone,
  Flame,
  Volume2,
} from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { usePickup } from "@/app/contexts/PickupContext";
import { useDrivers } from "@/app/contexts/DriversContext";
import WasteStreamChart from "./WasteStream";
import IsometricCentersHub from "./IsometricCentersHub";
import { notify } from "@/app/utils/notifications";

// Dynamic import of the map to prevent Next.js SSR breaks
const OverviewMap = dynamic(() => import("./OverviewMap"), { ssr: false });

// ── Compatibility Hooks ──
function useRole() {
  const { currentRole, setCurrentRole } = useRoleContext();
  return { role: currentRole, setRole: setCurrentRole };
}

// Premium Counter
function AnimatedCounter({ end, duration = 1.5 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    let startTime: number;
    let frame: number;
    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setCount(Math.floor(easeOutExpo(progress) * end));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return <>{count.toLocaleString()}</>;
}

export default function OverviewV1() {
  const router = useRouter();
  const { theme } = useTheme();
  const { role: currentRole } = useRole();
  const { requests } = usePickup();
  const { drivers } = useDrivers();

  const [selectedRequestId, setSelectedRequestId] = useState<string>("REQ-101");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("month");
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dashboardStyle, setDashboardStyle] = useState<"classic" | "glass">("glass");

  // Active Request detail mapping (Left Column)
  const activeRequest = requests.find((r: any) => r.id === selectedRequestId) || requests[0];
  const totalWeight = activeRequest.items.reduce((s: number, i: any) => s + i.expectedWeightKg, 0);
  const totalQuantity = activeRequest.items.reduce((s: number, i: any) => s + i.expectedQuantity, 0);
  const percentCapacity = Math.min(100, Math.round((totalQuantity / 400) * 100));

  // Role Greetings mapping
  const greetings: Record<string, { title: string; subtitle: string }> = {
    admin: { title: "Operations Console", subtitle: "Live waste streams and dispatch dispatching cockpit" },
    manager: { title: "Regional Dashboard", subtitle: "Logistics speed maps and active zone indices" },
    driver: { title: "My Route Center", subtitle: "Coordinates and current drop-off routes" },
    citizen: { title: "Recycle Center", subtitle: "Your eco points ledger and request pipeline" },
  };
  const greeting = greetings[currentRole] || greetings.admin;

  // Adaptive style palettes
  const isGlass = dashboardStyle === "glass";
  const neonCyan = isGlass ? "#4ED0F5" : "#00E5FF";

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 relative font-sans text-black dark:text-white transition-colors duration-300">
      
      {/* ── AMBIENT AURORA GLOWS FOR GLASS MODE ── */}
      {isGlass && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[10%] right-[5%] w-[450px] h-[450px] bg-[#4ED0F5]/10 dark:bg-[#4ED0F5]/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[20%] left-[2%] w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        </div>
      )}

      {/* ── TOPBAR DYNAMIC OPERATIONAL METRICS CAPSULES ── */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between ${
        isGlass 
          ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)]" 
          : "bg-white/70 dark:bg-[#0a0e14]/95 backdrop-blur-2xl border border-white/60 dark:border-[#00E5FF]/15 shadow-[0_8px_32px_rgba(139,94,60,0.07)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
      } p-6 rounded-[32px] mb-8 gap-6 transition-all duration-300 relative overflow-hidden`}>
        {/* Neon top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-[#00E5FF]/70 dark:to-transparent" />
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#0891B2] dark:bg-[#00E5FF] rounded-2xl flex items-center justify-center text-white dark:text-[#131518] shadow-lg shadow-[#0891B2]/20 dark:shadow-[0_0_20px_rgba(0,229,255,0.5)]">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase">CREATORA ECOVOID</h1>
            <p className="text-[9px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-extrabold">Active System Console</p>
          </div>
        </div>

        {/* Global operational indicators */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 dark:text-white/30">
          <div className="flex items-center gap-2 border-r border-slate-200/40 dark:border-white/5 pr-6">
            <span>Active Requests</span>
            <span className="text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
              <AnimatedCounter end={requests.length} />
            </span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-200/40 dark:border-white/5 pr-6">
            <span>Route Drivers</span>
            <span className="text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">
              <AnimatedCounter end={drivers.length} />
            </span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-200/40 dark:border-white/5 pr-6">
            <span>Avg Dispatch</span>
            <span className="text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]">14<span className="text-[9px] text-slate-400 dark:text-[#00E5FF]/50 ml-0.5">min</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span>CO₂ Saved</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">2,340<span className="text-[9px] text-emerald-500/60 dark:text-emerald-500/50 ml-0.5">kg</span></span>
          </div>
        </div>

        {/* System Settings & Filters */}
        <div className="flex items-center gap-4">
          {/* Dashboard Edition Switcher */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
            <button
              onClick={() => setDashboardStyle("glass")}
              className={`text-[9px] font-black uppercase tracking-wider rounded-full px-4 py-2 transition-all ${
                isGlass
                  ? "bg-white dark:bg-white/10 text-cyan-600 dark:text-[#4ED0F5] shadow-sm font-extrabold"
                  : "text-slate-500 dark:text-white/40 hover:text-slate-800"
              }`}
            >
              Glass Edition
            </button>
            <button
              onClick={() => setDashboardStyle("classic")}
              className={`text-[9px] font-black uppercase tracking-wider rounded-full px-4 py-2 transition-all ${
                !isGlass
                  ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm font-extrabold"
                  : "text-slate-500 dark:text-white/40 hover:text-slate-800"
              }`}
            >
              Classic Edition
            </button>
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 text-black dark:text-white text-[10px] font-black uppercase tracking-wider rounded-full px-5 py-2.5 outline-none cursor-pointer shadow-inner transition-colors"
          >
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-white/5 border border-black/5 dark:border-white/5 px-5 py-2.5 rounded-full shadow-sm">
            <motion.div
              className="w-2 h-2 bg-emerald-500 rounded-full"
              animate={{
                scale: [1, 1.25, 1],
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 5px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">LIVE FEED</span>
          </div>
        </div>
      </div>

      {/* ── THREE-COLUMN COCKPIT GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT COLUMN: DETAILS & ROUTE MAP (col-span-3) ================= */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Top Panel: Selected Request Details */}
          <div className={`${
            isGlass 
              ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]" 
              : "bg-white dark:bg-gradient-to-b dark:from-[#353b43] dark:via-[#262c33] dark:to-[#171a1f] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(139,94,60,0.06)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
          } text-slate-900 dark:text-white p-6 rounded-[36px] flex flex-col gap-5 relative overflow-hidden transition-all duration-300`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3.5 z-10">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase ${isGlass ? "bg-white/50 dark:bg-white/[0.05]" : "bg-slate-100 dark:bg-black/40"} px-3 py-1 rounded-full tracking-widest text-slate-600 dark:text-white/90`}>
                  Request
                </span>
                <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-white/60">{activeRequest.id}</span>
              </div>
              <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm ${
                activeRequest.priority === "Critical" ? "bg-red-500 text-white animate-pulse" : isGlass ? "bg-[#4ED0F5] text-[#131518]" : "bg-[#0891B2] dark:bg-[#00E5FF] text-white dark:text-[#131518]"
              }`}>
                {activeRequest.priority}
              </span>
            </div>

            {/* Citizen Details */}
            <div className="z-10">
              <h2 className="text-2xl font-black tracking-tight uppercase leading-none mb-1.5 text-slate-900 dark:text-white">
                {activeRequest.citizen.name}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-white/60 font-black uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className={`w-3.5 h-3.5 ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"}`} />
                {activeRequest.zone.name}
              </p>
            </div>

            {/* Volume Stats */}
            <div className={`grid grid-cols-2 gap-4 ${isGlass ? "bg-white/20 dark:bg-white/[0.03] border border-white/10 dark:border-white/[0.04]" : "bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5"} p-4 rounded-2xl z-10`}>
              <div>
                <p className="text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1">Est. Weight</p>
                <p className="text-xl font-black leading-none text-slate-900 dark:text-white">
                  {totalWeight.toFixed(1)} <span className="text-xs font-semibold text-slate-500 dark:text-white/55">kg</span>
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1">Quantity</p>
                <p className="text-xl font-black leading-none text-slate-900 dark:text-white">
                  {totalQuantity} <span className="text-xs font-semibold text-slate-500 dark:text-white/55">pcs</span>
                </p>
              </div>
            </div>

            {/* Used Capacity Progress bar */}
            <div className="z-10">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-white/60">
                <span>Used Capacity</span>
                <span className={`${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"} font-black`}>{percentCapacity}%</span>
              </div>
              <div className={`h-2 w-full ${isGlass ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-black/40"} rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r ${isGlass ? "from-cyan-400 to-[#4ED0F5]" : "from-cyan-500 to-blue-500"} rounded-full`} style={{ width: `${percentCapacity}%` }} />
              </div>
            </div>

            {/* Assigned Driver Profile */}
            <div className={`flex items-center justify-between ${isGlass ? "bg-white/20 dark:bg-white/[0.03] border border-white/10 dark:border-white/[0.04]" : "bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5"} p-4 rounded-2xl z-10`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                  {activeRequest.driver ? activeRequest.driver.name.slice(0,2).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest leading-none mb-1">Assigned Driver</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {activeRequest.driver ? activeRequest.driver.name : "Dispatcher Queue"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => activeRequest.driver && notify.info("Calling Driver", `Connecting line to ${activeRequest.driver.name}...`)}
                className={`w-9 h-9 rounded-xl ${isGlass ? "bg-[#4ED0F5]/10 hover:bg-[#4ED0F5]/20 text-[#4ED0F5] border border-[#4ED0F5]/10" : "bg-cyan-50 dark:bg-[#00E5FF]/10 hover:bg-cyan-100 dark:hover:bg-[#00E5FF]/20 text-[#0891B2] dark:text-[#00E5FF] border border-cyan-100 dark:border-[#00E5FF]/10"} flex items-center justify-center transition-colors`}
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Pill Cards */}
            <div className="grid grid-cols-2 gap-3.5 z-10">
              <div className={`p-3.5 ${isGlass ? "bg-white/20 dark:bg-white/[0.03] border border-white/10 dark:border-white/[0.04]" : "bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5"} flex flex-col justify-between h-[70px]`}>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-white/55 tracking-widest">Status Index</span>
                <span className={`text-xs font-black uppercase ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"}`}>{activeRequest.status}</span>
              </div>
              <div className={`p-3.5 ${isGlass ? "bg-white/20 dark:bg-white/[0.03] border border-white/10 dark:border-white/[0.04]" : "bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5"} flex flex-col justify-between h-[70px]`}>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-white/55 tracking-widest">Plastic Type</span>
                <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">{activeRequest.items[0]?.plasticType ?? "PET"}</span>
              </div>
            </div>
          </div>

          {/* Bottom Panel: "ROUTE MAP" interactive coordinate map */}
          <div className={`${
            isGlass 
              ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]" 
              : "bg-white/70 dark:bg-[#0a0e14] backdrop-blur-xl border border-white/60 dark:border-[#00E5FF]/15 shadow-[0_8px_32px_rgba(139,94,60,0.07)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
          } text-slate-900 dark:text-white p-4 rounded-[32px] flex flex-col gap-4 flex-1 min-h-[300px] overflow-hidden relative transition-all duration-300`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3 shrink-0">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isGlass ? "text-[#4ED0F5] dark:drop-shadow-[0_0_8px_rgba(78,208,245,0.4)]" : "text-[#0891B2] dark:text-[#00E5FF] dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]"} flex items-center gap-1.5`}>
                <Flame className="w-3.5 h-3.5" />
                Live Route Map
              </span>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className={`w-1.5 h-1.5 ${isGlass ? "bg-[#4ED0F5]" : "bg-[#00E5FF]"} rounded-full hidden dark:block`}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className={`text-[8px] font-extrabold ${isGlass ? "bg-white/50 dark:bg-white/[0.06]" : "bg-slate-100 dark:bg-[#0e1420]"} text-slate-500 dark:text-white/60 uppercase tracking-widest px-2.5 py-0.5 rounded-full`}>
                  Interactive
                </span>
              </div>
            </div>

            {/* Leaflet Dynamic Map Container — with animated glow border in dark mode */}
            <div className={`flex-1 w-full h-full rounded-2xl overflow-hidden border-2 ${isGlass ? "border-white/20 dark:border-[#4ED0F5]/25" : "border-slate-200/50 dark:border-[#00E5FF]/25"} min-h-[220px] shadow-[0_4px_12px_rgba(226,232,240,0.3)] dark:shadow-[inset_0_0_30px_rgba(0,229,255,0.06),0_0_25px_rgba(0,229,255,0.1)]`}>
              <OverviewMap />
            </div>

            {/* Ambient glow behind map */}
            <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-16 ${isGlass ? "bg-[#4ED0F5]/10" : "bg-[#0891B2]/3 dark:bg-[#00E5FF]/8"} rounded-full blur-3xl pointer-events-none`} />
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: CHART & SYSTEM health (col-span-6) ================= */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          
          {/* Top Panel: Main visualizer Waste Stream Chart */}
          <div className={`${
            isGlass 
              ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]" 
              : "bg-white/70 dark:bg-[#0a0e14] backdrop-blur-xl border border-white/60 dark:border-white/[0.06] shadow-[0_8px_32px_rgba(139,94,60,0.07)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
          } text-black dark:text-white rounded-[32px] p-6 min-h-[400px] flex flex-col justify-between overflow-hidden transition-all duration-300`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"}`} />
                <span className="text-xs font-black uppercase tracking-widest">{greeting.title}</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider">
                {greeting.subtitle}
              </div>
            </div>

            <div className="flex-1 w-full h-full min-h-[280px] flex items-center justify-center">
              <WasteStreamChart />
            </div>
          </div>

          {/* Bottom Panel: Dynamic analytics condition grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Daily Active Time — Premium Styled card */}
            <div className={`${
              isGlass 
                ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]" 
                : "bg-white dark:bg-gradient-to-b dark:from-[#353b43] dark:via-[#262c33] dark:to-[#171a1f] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(139,94,60,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            } rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00E5FF] dark:bg-[#00E5FF]" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-extrabold uppercase tracking-widest leading-none mb-2">
                  Daily Active Time
                </p>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  8h 40m <span className="text-sm font-medium text-slate-400 dark:text-white/40">/ 10h</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-[#00FF87] mt-1.5 inline-flex items-center gap-0.5">↑ 12%</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-white/50 mb-1.5">
                  <span>Usage Rate</span>
                  <span className={`${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"} font-black`}>80%</span>
                </div>
                <div className={`h-1.5 w-full ${isGlass ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-black/40"} rounded-full overflow-hidden`}>
                  <div className={`h-full ${isGlass ? "bg-[#4ED0F5]" : "bg-[#0891B2] dark:bg-[#00E5FF]"} rounded-full`} style={{ width: "80%" }} />
                </div>
              </div>
            </div>

            {/* 2. Collection Rate — Premium Styled card */}
            <div className={`${
              isGlass 
                ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]" 
                : "bg-white dark:bg-gradient-to-b dark:from-[#353b43] dark:via-[#262c33] dark:to-[#171a1f] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(139,94,60,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            } rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF9F00] dark:bg-[#FF9F00]" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-extrabold uppercase tracking-widest leading-none mb-2">
                  Collection Rate
                </p>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  72.4 <span className="text-xs font-semibold text-slate-500 dark:text-white/55">btl/hr</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-[#00FF87] mt-1.5 inline-flex items-center gap-0.5">↑ 8.3%</span>
              </div>
              
              <button className={`w-full mt-4 flex items-center justify-center gap-2 ${isGlass ? "bg-[#4ED0F5]/10 hover:bg-[#4ED0F5]/20 text-[#4ED0F5] border border-[#4ED0F5]/10" : "bg-cyan-50 dark:bg-white/5 border border-cyan-100 dark:border-white/5 text-[#0891B2] dark:text-[#00E5FF] hover:bg-cyan-100 dark:hover:bg-white/10"} rounded-2xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-inner`}>
                <Sparkles className="w-4 h-4" />
                Optimal Flow
              </button>
            </div>

            {/* 3. System Health — Premium Styled card */}
            <div className={`${
              isGlass 
                ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]" 
                : "bg-white dark:bg-gradient-to-b dark:from-[#353b43] dark:via-[#262c33] dark:to-[#171a1f] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_rgba(139,94,60,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            } rounded-[32px] p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group transition-all duration-300`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00FF87] dark:bg-[#00FF87]" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-extrabold uppercase tracking-widest leading-none mb-3">
                  System Health
                </p>
                
                <div className="space-y-2.5">
                  {[
                    { label: "Dispatch", val: 90, color: isGlass ? "bg-[#4ED0F5]" : "bg-[#0891B2] dark:bg-[#00E5FF]" },
                    { label: "Transit", val: 82, color: "bg-[#FF9F00]" },
                    { label: "Completed", val: 88, color: "bg-[#00FF87]" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[10px] font-black text-slate-500 dark:text-white/60">
                      <span className="w-14 shrink-0 text-slate-400 dark:text-white/55">{item.label}</span>
                      <div className={`flex-1 h-1.5 ${isGlass ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-black/40"} rounded-full overflow-hidden`}>
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                      </div>
                      <span className="text-slate-800 dark:text-white font-black w-8 text-right">{item.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DISPATCH PIPELINE (col-span-3) ================= */}
        <div className={`xl:col-span-3 ${
          isGlass 
            ? "bg-white/40 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]" 
            : "bg-white/70 dark:bg-[#0a0e14] backdrop-blur-xl border border-white/60 dark:border-[#00E5FF]/15 shadow-[0_8px_32px_rgba(139,94,60,0.07)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        } text-slate-900 dark:text-white p-5 rounded-[32px] flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 min-h-[500px]`}>
          {/* Neon top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-[#00E5FF]/60 dark:to-transparent z-20" />
          
          <div className="space-y-4 relative z-10 w-full">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isGlass ? "text-[#4ED0F5] dark:drop-shadow-[0_0_8px_rgba(78,208,245,0.4)]" : "text-[#0891B2] dark:text-[#00E5FF] dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"}`}>
                Collection Pipeline
              </span>
              <button 
                onClick={() => startTransition(() => router.push("/pickup-requests"))}
                className={`text-[9px] ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"} hover:text-cyan-700 dark:hover:text-cyan-300 font-extrabold uppercase tracking-widest transition-colors cursor-pointer`}
              >
                Manage All
              </button>
            </div>

            {/* Scrollable list of custom requests */}
            <div className="space-y-3.5 overflow-y-auto no-scrollbar max-h-[420px] pr-1">
              {requests.map((req: any) => {
                const totalQ = req.items.reduce((s: number, i: any) => s + i.expectedQuantity, 0);
                const reqCapacity = Math.min(100, Math.round((totalQ / 400) * 100));
                const isSelected = req.id === selectedRequestId;

                return (
                  <motion.div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                      isSelected
                        ? isGlass
                          ? "bg-[#4ED0F5]/5 dark:bg-[#4ED0F5]/[0.07] border-[#4ED0F5]/40 dark:border-[#4ED0F5]/35 shadow-[0_4px_15px_rgba(78,208,245,0.06)] dark:shadow-[0_0_20px_rgba(78,208,245,0.15)]"
                          : "bg-[#0891B2]/5 dark:bg-[#00E5FF]/[0.07] border-[#0891B2]/40 dark:border-[#00E5FF]/35 shadow-[0_4px_15px_rgba(8,145,178,0.06)] dark:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                        : isGlass
                          ? "bg-white/10 dark:bg-[#0e1420] border-white/10 dark:border-white/[0.06] hover:bg-white/20 dark:hover:bg-[#222930] hover:shadow-sm"
                          : "bg-slate-50/50 dark:bg-[#0e1420] border-black/[0.03] dark:border-white/[0.06] hover:bg-slate-100/60 dark:hover:bg-[#222930] hover:shadow-sm"
                    }`}
                  >
                    {/* Selected indicator glow bar */}
                    {isSelected && (
                      <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${isGlass ? "bg-[#4ED0F5] dark:bg-gradient-to-r dark:from-[#4ED0F5]/80" : "bg-[#0891B2] dark:bg-gradient-to-r dark:from-[#00E5FF]/80"} dark:via-blue-500/40 dark:to-transparent`} />
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm truncate max-w-[150px]">
                          {req.citizen.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 dark:text-white/40 font-semibold">{req.zone.name}</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        req.priority === "Critical" ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/70"
                      }`}>
                        {req.id}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-white/50 font-bold mt-1">
                      <span>Volume: {totalQ} pcs</span>
                      <span className="text-slate-900 dark:text-white">{reqCapacity}%</span>
                    </div>

                    <div className={`h-1.5 w-full ${isGlass ? "bg-white/20 dark:bg-white/10" : "bg-slate-100 dark:bg-white/10"} rounded-full overflow-hidden dark:shadow-[0_0_6px_rgba(0,229,255,0.15)]`}>
                      <div className={`h-full bg-gradient-to-r ${isGlass ? "from-cyan-400 to-[#4ED0F5] dark:from-[#4ED0F5]" : "from-cyan-500 to-blue-500 dark:from-[#00E5FF]"} dark:to-blue-500 dark:shadow-[0_0_8px_rgba(0,229,255,0.3)]`} style={{ width: `${reqCapacity}%` }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Banner — Glassmorphism in dark mode */}
          <div className={`${
            isGlass 
              ? "bg-white/30 dark:bg-white/[0.03] border border-white/20 dark:border-white/15" 
              : "bg-white/60 dark:bg-white/[0.03] border border-white/60 dark:border-[#00E5FF]/20"
          } backdrop-blur-2xl rounded-2xl p-4 flex flex-col gap-1.5 z-10 shadow-sm transition-all duration-300`}>
            <span className={`text-[8px] font-extrabold uppercase tracking-widest ${isGlass ? "text-[#4ED0F5] dark:drop-shadow-[0_0_6px_rgba(78,208,245,0.5)]" : "text-[#0891B2] dark:text-[#00E5FF] dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"}`}>
              Pipeline Speed
            </span>
            <div className="text-lg font-black">98.4% Efficiency</div>
            <p className="text-[10px] text-slate-400 dark:text-white/40 leading-relaxed font-semibold">
              Live neural analysis and driver logs synchronized.
            </p>
          </div>

          {/* Stronger ambient glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#0891B2]/6 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#0891B2]/3 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* ── ISOMETRIC CENTERS HUB — Full Width Infrastructure View ── */}
      <div className="mt-8">
        <IsometricCentersHub />
      </div>

    </div>
  );
}


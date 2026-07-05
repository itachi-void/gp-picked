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

/* ─────────────────────────────────────────────────────
   SHARED CARD STYLES — Single source of truth
   Light: solid white, visible border, strong shadow
   Dark: deep dark glass, neon accents, glow shadows
   ───────────────────────────────────────────────────── */
const card = {
  base: "bg-white dark:bg-[#0c1017]/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_1px_rgba(0,229,255,0.08)] rounded-[28px] transition-all duration-300",
  inner: "bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] rounded-2xl",
};

/* Unified accent colors — only Teal + Emerald */
const accent = {
  primary: "text-teal-600 dark:text-[#00E5FF]",
  primaryBg: "bg-teal-600 dark:bg-[#00E5FF]",
  primarySoft: "bg-teal-50 dark:bg-[#00E5FF]/[0.07]",
  glow: "dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]",
  border: "border-teal-200 dark:border-[#00E5FF]/20",
};

export default function OverviewV2() {
  const router = useRouter();
  const { theme } = useTheme();
  const { role: currentRole } = useRole();
  const { requests } = usePickup();
  const { drivers } = useDrivers();

  const [selectedRequestId, setSelectedRequestId] = useState<string>("REQ-101");
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("month");

  // Active Request detail mapping (Left Column)
  const activeRequest = requests.find((r: any) => r.id === selectedRequestId) || requests[0];
  const totalWeight = activeRequest.items.reduce((s: number, i: any) => s + i.expectedWeightKg, 0);
  const totalQuantity = activeRequest.items.reduce((s: number, i: any) => s + i.expectedQuantity, 0);
  const percentCapacity = Math.min(100, Math.round((totalQuantity / 400) * 100));

  // Role Greetings mapping
  const greetings: Record<string, { title: string; subtitle: string }> = {
    admin: { title: "Operations Console", subtitle: "Live waste streams and dispatch cockpit" },
    manager: { title: "Regional Dashboard", subtitle: "Logistics speed maps and active zone indices" },
    driver: { title: "My Route Center", subtitle: "Coordinates and current drop-off routes" },
    citizen: { title: "Recycle Center", subtitle: "Your eco points ledger and request pipeline" },
  };
  const greeting = greetings[currentRole] || greetings.admin;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 relative font-sans text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* ── SUBTLE AMBIENT GLOWS — toned down for light, enhanced for dark ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-teal-500/[0.04] dark:bg-[#00E5FF]/[0.12] rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[20%] left-[2%] w-[350px] h-[350px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.08] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* ── TOPBAR — elevated, crisp, high-contrast ── */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between ${card.base} p-6 mb-8 gap-6 relative overflow-hidden`}>
        {/* Neon top accent line — visible in both modes */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/50 dark:via-[#00E5FF]/70 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className={`size-10 ${accent.primaryBg} rounded-2xl flex items-center justify-center text-white dark:text-[#0a0e14] shadow-lg shadow-teal-500/20 dark:shadow-[0_0_20px_rgba(0,229,255,0.5)]`}>
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest uppercase text-slate-900 dark:text-white">CREATORA ECOVOID</h1>
            <p className="text-[9px] text-slate-500 dark:text-white/50 uppercase tracking-widest font-extrabold">Active System Console</p>
          </div>
        </div>

        {/* Global operational indicators — stronger label contrast */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 dark:text-white/45">
          <div className="flex items-center gap-2 border-r border-slate-200 dark:border-white/[0.06] pr-6">
            <span>Active Requests</span>
            <span className={`text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight ${accent.glow}`}>
              <AnimatedCounter end={requests.length} />
            </span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-200 dark:border-white/[0.06] pr-6">
            <span>Route Drivers</span>
            <span className={`text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight ${accent.glow}`}>
              <AnimatedCounter end={drivers.length} />
            </span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-200 dark:border-white/[0.06] pr-6">
            <span>Avg Dispatch</span>
            <span className={`text-lg font-black text-slate-900 dark:text-[#00E5FF] tracking-tight ${accent.glow}`}>14<span className="text-[9px] text-slate-400 dark:text-[#00E5FF]/50 ml-0.5">min</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span>CO₂ Saved</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">2,340<span className="text-[9px] text-emerald-500/70 ml-0.5">kg</span></span>
          </div>
        </div>

        {/* System Settings & Filters */}
        <div className="flex items-center gap-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-full px-5 py-2.5 outline-none cursor-pointer transition-colors"
          >
            <option value="today">Today</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06] px-5 py-2.5 rounded-full">
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
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/50">LIVE FEED</span>
          </div>
        </div>
      </div>

      {/* ── THREE-COLUMN COCKPIT GRID ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT COLUMN: DETAILS & ROUTE MAP (col-span-3) ================= */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Top Panel: Selected Request Details */}
          <div className={`${card.base} text-slate-900 dark:text-white p-6 flex flex-col gap-5 relative overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3.5 z-10">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase bg-slate-100 dark:bg-white/[0.06] px-3 py-1 rounded-full tracking-widest text-slate-600 dark:text-white/80">
                  Request
                </span>
                <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-white/50">{activeRequest.id}</span>
              </div>
              <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm ${
                activeRequest.priority === "Critical" ? "bg-red-500 text-white animate-pulse" : `${accent.primaryBg} text-white dark:text-[#0a0e14]`
              }`}>
                {activeRequest.priority}
              </span>
            </div>

            {/* Citizen Details */}
            <div className="z-10">
              <h2 className="text-2xl font-black tracking-tight uppercase leading-none mb-1.5">
                {activeRequest.citizen.name}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-white/55 font-black uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className={`w-3.5 h-3.5 ${accent.primary}`} />
                {activeRequest.zone.name}
              </p>
            </div>

            {/* Volume Stats */}
            <div className={`grid grid-cols-2 gap-4 ${card.inner} p-4 z-10`}>
              <div>
                <p className="text-[8px] font-black text-slate-400 dark:text-white/45 uppercase tracking-widest mb-1">Est. Weight</p>
                <p className="text-xl font-black leading-none">
                  {totalWeight.toFixed(1)} <span className="text-xs font-semibold text-slate-400 dark:text-white/50">kg</span>
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 dark:text-white/45 uppercase tracking-widest mb-1">Quantity</p>
                <p className="text-xl font-black leading-none">
                  {totalQuantity} <span className="text-xs font-semibold text-slate-400 dark:text-white/50">pcs</span>
                </p>
              </div>
            </div>

            {/* Used Capacity Progress bar */}
            <div className="z-10">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-white/55">
                <span>Used Capacity</span>
                <span className={`${accent.primary} font-black`}>{percentCapacity}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-[#00E5FF] dark:to-cyan-400 rounded-full" style={{ width: `${percentCapacity}%` }} />
              </div>
            </div>

            {/* Assigned Driver Profile */}
            <div className={`flex items-center justify-between ${card.inner} p-4 z-10`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                  {activeRequest.driver ? activeRequest.driver.name.slice(0,2).toUpperCase() : "?"}
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 dark:text-white/45 uppercase tracking-widest leading-none mb-1">Assigned Driver</p>
                  <p className="text-sm font-black">
                    {activeRequest.driver ? activeRequest.driver.name : "Dispatcher Queue"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => activeRequest.driver && notify.info("Calling Driver", `Connecting line to ${activeRequest.driver.name}...`)}
                className={`w-9 h-9 rounded-xl ${accent.primarySoft} ${accent.primary} border ${accent.border} flex items-center justify-center transition-colors hover:bg-teal-100 dark:hover:bg-[#00E5FF]/15`}
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Pill Cards */}
            <div className="grid grid-cols-2 gap-3.5 z-10">
              <div className={`p-3.5 ${card.inner} flex flex-col justify-between h-[70px]`}>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-white/50 tracking-widest">Status Index</span>
                <span className={`text-xs font-black uppercase ${accent.primary}`}>{activeRequest.status}</span>
              </div>
              <div className={`p-3.5 ${card.inner} flex flex-col justify-between h-[70px]`}>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-white/50 tracking-widest">Plastic Type</span>
                <span className="text-xs font-black uppercase text-teal-700 dark:text-cyan-400">{activeRequest.items[0]?.plasticType ?? "PET"}</span>
              </div>
            </div>
          </div>

          {/* Bottom Panel: "ROUTE MAP" interactive coordinate map */}
          <div className={`${card.base} text-slate-900 dark:text-white p-4 flex flex-col gap-4 flex-1 min-h-[300px] overflow-hidden relative`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3 shrink-0">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${accent.primary} ${accent.glow} flex items-center gap-1.5`}>
                <Flame className="w-3.5 h-3.5" />
                Live Route Map
              </span>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full hidden dark:block"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[8px] font-extrabold bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/55 uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Interactive
                </span>
              </div>
            </div>

            {/* Leaflet Dynamic Map Container */}
            <div className="flex-1 w-full h-full rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#00E5FF]/20 min-h-[220px] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0_30px_rgba(0,229,255,0.06),0_0_25px_rgba(0,229,255,0.1)]">
              <OverviewMap />
            </div>
          </div>
        </div>

        {/* ================= MIDDLE COLUMN: CHART & SYSTEM health (col-span-6) ================= */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          
          {/* Top Panel: Main visualizer Waste Stream Chart */}
          <div className={`${card.base} text-slate-900 dark:text-white p-6 min-h-[400px] flex flex-col justify-between overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${accent.primary}`} />
                <span className="text-xs font-black uppercase tracking-widest">{greeting.title}</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-white/45 font-bold uppercase tracking-wider">
                {greeting.subtitle}
              </div>
            </div>

            <div className="flex-1 w-full h-full min-h-[280px] flex items-center justify-center">
              <WasteStreamChart />
            </div>
          </div>

          {/* Bottom Panel: Dynamic analytics condition grid — ELEVATED CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Daily Active Time */}
            <div className={`${card.base} p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-cyan-400 dark:from-[#00E5FF] dark:to-cyan-400" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-white/50 font-extrabold uppercase tracking-widest leading-none mb-2">
                  Daily Active Time
                </p>
                <h4 className="text-3xl font-black leading-tight">
                  8h 40m <span className="text-sm font-medium text-slate-400 dark:text-white/40">/ 10h</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 inline-flex items-center gap-0.5">↑ 12%</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-white/50 mb-1.5">
                  <span>Usage Rate</span>
                  <span className={`${accent.primary} font-black`}>80%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 dark:bg-[#00E5FF] rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
            </div>

            {/* 2. Collection Rate */}
            <div className={`${card.base} p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-white/50 font-extrabold uppercase tracking-widest leading-none mb-2">
                  Collection Rate
                </p>
                <h4 className="text-3xl font-black leading-tight">
                  72.4 <span className="text-xs font-semibold text-slate-400 dark:text-white/50">btl/hr</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 inline-flex items-center gap-0.5">↑ 8.3%</span>
              </div>
              
              <button className={`w-full mt-4 flex items-center justify-center gap-2 ${accent.primarySoft} border ${accent.border} ${accent.primary} rounded-2xl py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-teal-100 dark:hover:bg-[#00E5FF]/15`}>
                <Sparkles className="w-4 h-4" />
                Optimal Flow
              </button>
            </div>

            {/* 3. System Health */}
            <div className={`${card.base} p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-green-500" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-white/50 font-extrabold uppercase tracking-widest leading-none mb-3">
                  System Health
                </p>
                
                <div className="space-y-2.5">
                  {[
                    { label: "Dispatch", val: 90, color: "bg-teal-500 dark:bg-[#00E5FF]" },
                    { label: "Transit", val: 82, color: "bg-amber-500" },
                    { label: "Completed", val: 88, color: "bg-emerald-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[10px] font-black text-slate-600 dark:text-white/60">
                      <span className="w-14 shrink-0 text-slate-500 dark:text-white/50">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                      </div>
                      <span className="font-black w-8 text-right">{item.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DISPATCH PIPELINE (col-span-3) ================= */}
        <div className={`xl:col-span-3 ${card.base} text-slate-900 dark:text-white p-5 flex flex-col justify-between gap-5 relative overflow-hidden min-h-[500px]`}>
          {/* Neon top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/40 dark:via-[#00E5FF]/60 to-transparent z-20" />
          
          <div className="space-y-4 relative z-10 w-full">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${accent.primary} ${accent.glow}`}>
                Collection Pipeline
              </span>
              <button 
                onClick={() => startTransition(() => router.push("/pickup-requests"))}
                className={`text-[9px] ${accent.primary} hover:text-teal-800 dark:hover:text-cyan-300 font-extrabold uppercase tracking-widest transition-colors cursor-pointer`}
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
                        ? `bg-teal-50 dark:bg-[#00E5FF]/[0.06] border-teal-300 dark:border-[#00E5FF]/30 shadow-[0_4px_15px_rgba(20,184,166,0.08)] dark:shadow-[0_0_20px_rgba(0,229,255,0.12)]`
                        : "bg-slate-50/60 dark:bg-[#0e1420] border-slate-200/60 dark:border-white/[0.06] hover:bg-slate-100/70 dark:hover:bg-[#161d28] hover:shadow-sm"
                    }`}
                  >
                    {/* Selected indicator glow bar */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-teal-500 dark:bg-gradient-to-r dark:from-[#00E5FF]/80 dark:via-cyan-500/40 dark:to-transparent" />
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm truncate max-w-[150px]">
                          {req.citizen.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 dark:text-white/45 font-semibold">{req.zone.name}</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        req.priority === "Critical" ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/60"
                      }`}>
                        {req.id}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-white/50 font-bold mt-1">
                      <span>Volume: {totalQ} pcs</span>
                      <span className="text-slate-800 dark:text-white">{reqCapacity}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/[0.08] rounded-full overflow-hidden dark:shadow-[0_0_6px_rgba(0,229,255,0.12)]">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-[#00E5FF] dark:to-cyan-500 dark:shadow-[0_0_8px_rgba(0,229,255,0.25)]" style={{ width: `${reqCapacity}%` }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className={`${card.inner} backdrop-blur-2xl p-4 flex flex-col gap-1.5 z-10 shadow-sm`}>
            <span className={`text-[8px] font-extrabold uppercase tracking-widest ${accent.primary} ${accent.glow}`}>
              Pipeline Speed
            </span>
            <div className="text-lg font-black">98.4% Efficiency</div>
            <p className="text-[10px] text-slate-400 dark:text-white/45 leading-relaxed font-semibold">
              Live neural analysis and driver logs synchronized.
            </p>
          </div>

          {/* Subtle ambient glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/[0.04] dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-500/[0.02] dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* ── ISOMETRIC CENTERS HUB — Full Width Infrastructure View ── */}
      <div className="mt-8">
        <IsometricCentersHub />
      </div>

    </div>
  );
}

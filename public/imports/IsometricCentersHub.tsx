"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Thermometer,
  Fuel,
  Container,
  BarChart3,
  Wifi,
  Activity,
  ArrowUpRight,
  Building2,
  Recycle,
  Truck,
  Package,
  MapPin,
} from "lucide-react";

/* ────────────────────────────────────────────
   Center Node data model
   ──────────────────────────────────────────── */
interface CenterNode {
  id: string;
  name: string;
  nameAr: string;
  type:
    | "collection"
    | "sorting"
    | "processing"
    | "distribution";
  status: "online" | "maintenance" | "offline";
  /** Position on the isometric grid (percentage-based) */
  x: number;
  y: number;
  capacity: number;
  throughput: number;
  efficiency: number;
  co2Saved: number;
  temperature: number;
  activeDrivers: number;
}

const CENTERS: CenterNode[] = [
  {
    id: "C1",
    name: "Main Collection Hub",
    nameAr: "مركز التجميع الرئيسي",
    type: "collection",
    status: "online",
    x: 15,
    y: 30,
    capacity: 87,
    throughput: 1240,
    efficiency: 94,
    co2Saved: 420,
    temperature: 24,
    activeDrivers: 8,
  },
  {
    id: "C2",
    name: "Sorting Facility",
    nameAr: "مرفق الفرز",
    type: "sorting",
    status: "online",
    x: 42,
    y: 18,
    capacity: 72,
    throughput: 890,
    efficiency: 91,
    co2Saved: 310,
    temperature: 28,
    activeDrivers: 5,
  },
  {
    id: "C3",
    name: "Processing Plant",
    nameAr: "مصنع المعالجة",
    type: "processing",
    status: "online",
    x: 70,
    y: 28,
    capacity: 64,
    throughput: 560,
    efficiency: 88,
    co2Saved: 580,
    temperature: 34,
    activeDrivers: 3,
  },
  {
    id: "C4",
    name: "Distribution Center",
    nameAr: "مركز التوزيع",
    type: "distribution",
    status: "maintenance",
    x: 55,
    y: 58,
    capacity: 45,
    throughput: 320,
    efficiency: 76,
    co2Saved: 190,
    temperature: 22,
    activeDrivers: 4,
  },
  {
    id: "C5",
    name: "Eco Station East",
    nameAr: "المحطة البيئية شرق",
    type: "collection",
    status: "online",
    x: 25,
    y: 62,
    capacity: 91,
    throughput: 1100,
    efficiency: 96,
    co2Saved: 350,
    temperature: 26,
    activeDrivers: 6,
  },
];

/* Connections between centers */
const CONNECTIONS: [string, string][] = [
  ["C1", "C2"],
  ["C2", "C3"],
  ["C1", "C5"],
  ["C5", "C4"],
  ["C4", "C3"],
  ["C2", "C4"],
];

/* Type-specific styling */
const TYPE_CONFIG: Record<
  string,
  {
    gradient: string;
    icon: any;
    label: string;
    glow: string;
    glowLight: string;
    accent: string;
    lightWall: string;
    lightWallRight: string;
    lightTop: string;
    darkWall: string;
    darkWallRight: string;
    darkTop: string;
  }
> = {
  collection: {
    gradient: "from-cyan-500 to-blue-600",
    icon: Package,
    label: "Collection",
    glow: "rgba(0,229,255,0.45)",
    glowLight: "rgba(6,182,212,0.25)",
    accent: "#0891B2",
    lightWall: "#E0F2FE",
    lightWallRight: "#F0F9FF",
    lightTop: "#F8FCFF",
    darkWall: "#0B1E29",
    darkWallRight: "#0F2D3E",
    darkTop: "#173C52",
  },
  sorting: {
    gradient: "from-violet-500 to-purple-600",
    icon: Recycle,
    label: "Sorting",
    glow: "rgba(139,92,246,0.45)",
    glowLight: "rgba(139,92,246,0.25)",
    accent: "#7C3AED",
    lightWall: "#F3E8FF",
    lightWallRight: "#FAF5FF",
    lightTop: "#FDFBFF",
    darkWall: "#1A0F2E",
    darkWallRight: "#251442",
    darkTop: "#331C5A",
  },
  processing: {
    gradient: "from-amber-500 to-orange-600",
    icon: Building2,
    label: "Processing",
    glow: "rgba(245,158,11,0.45)",
    glowLight: "rgba(245,158,11,0.25)",
    accent: "#D97706",
    lightWall: "#FEF3C7",
    lightWallRight: "#FFFDF5",
    lightTop: "#FFFFFD",
    darkWall: "#2A1B05",
    darkWallRight: "#3B2607",
    darkTop: "#4D330A",
  },
  distribution: {
    gradient: "from-emerald-500 to-green-600",
    icon: Truck,
    label: "Distribution",
    glow: "rgba(16,185,129,0.45)",
    glowLight: "rgba(16,185,129,0.25)",
    accent: "#059669",
    lightWall: "#D1FAE5",
    lightWallRight: "#F0FDF4",
    lightTop: "#F8FEFA",
    darkWall: "#052214",
    darkWallRight: "#0A331E",
    darkTop: "#11462B",
  },
};

const STATUS_COLORS: Record<
  string,
  { dot: string; label: string }
> = {
  online: { dot: "bg-emerald-500", label: "Online" },
  maintenance: { dot: "bg-amber-500", label: "Maintenance" },
  offline: { dot: "bg-red-500", label: "Offline" },
};

/* ────────────────────────────────────────────
   IsometricBuilding — SVG isometric building
   ──────────────────────────────────────────── */
function IsometricBuilding({
  center,
  isActive,
  isDark,
  onClick,
}: {
  center: CenterNode;
  isActive: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  const config = TYPE_CONFIG[center.type];

  // Beautiful dynamic theme-aware architectural isometric walls and highlights
  const baseFill = isDark ? "#0D1117" : "#E2E8F0";

  const leftWall = isActive
    ? config.accent
    : isDark
      ? config.darkWall
      : config.lightWall;

  const rightWall = isActive
    ? isDark
      ? config.darkWallRight
      : config.lightWallRight
    : isDark
      ? config.darkWallRight
      : config.lightWallRight;

  const topFace = isActive
    ? isDark
      ? "#FFFFFF"
      : config.accent
    : isDark
      ? config.darkTop
      : config.lightTop;

  const activeStroke = config.accent;
  const inactiveStroke = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(0,0,0,0.08)";
  const inactiveStrokeWall = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.05)";

  const labelColor = isActive
    ? isDark
      ? "#00E5FF"
      : config.accent
    : isDark
      ? "rgba(255,255,255,0.75)"
      : "#334155";

  const capacityColor = isActive
    ? isDark
      ? "rgba(0,229,255,0.85)"
      : "rgba(8,145,178,0.85)"
    : isDark
      ? "rgba(255,255,255,0.4)"
      : "#64748B";

  const statusStroke = isDark ? "#0F1215" : "#FFFFFF";
  const glowColor = isDark ? config.glow : config.glowLight;

  const windowFill = isActive
    ? isDark
      ? "#00E5FF"
      : "#FFFFFF"
    : center.status === "online"
      ? isDark
        ? "#00E5FF"
        : config.accent
      : center.status === "maintenance"
        ? "#F59E0B"
        : "#EF4444";

  return (
    <motion.g
      style={{ cursor: "pointer" }}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.random() * 0.3 }}
    >
      {/* Glow base */}
      <ellipse
        cx={0}
        cy={42}
        rx={isActive ? 38 : 30}
        ry={isActive ? 16 : 12}
        fill={glowColor}
        opacity={isActive ? 0.6 : 0.25}
      >
        <animate
          attributeName="opacity"
          values={isActive ? "0.6;0.3;0.6" : "0.25;0.15;0.25"}
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Isometric base (bottom face) */}
      <polygon
        points="0,40 -28,26 0,12 28,26"
        fill={baseFill}
        stroke={isActive ? activeStroke : inactiveStroke}
        strokeWidth={isActive ? 1.5 : 0.5}
      />

      {/* Isometric left wall */}
      <polygon
        points="-28,26 -28,-14 0,-28 0,12"
        fill={leftWall}
        stroke={isActive ? activeStroke : inactiveStrokeWall}
        strokeWidth={isActive ? 1 : 0.3}
      />

      {/* Isometric right wall */}
      <polygon
        points="28,26 28,-14 0,-28 0,12"
        fill={rightWall}
        stroke={isActive ? activeStroke : inactiveStrokeWall}
        strokeWidth={isActive ? 1 : 0.3}
      />

      {/* Isometric top face */}
      <polygon
        points="0,-28 -28,-14 0,0 28,-14"
        fill={isActive && isDark ? activeStroke : topFace}
        opacity={isActive ? 0.95 : 0.8}
        stroke={
          isActive
            ? activeStroke
            : isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.08)"
        }
        strokeWidth={isActive ? 1.5 : 0.5}
      />

      {/* Small windows on left wall */}
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <rect
            key={`w-${row}-${col}`}
            x={-24 + col * 12 + row * 4}
            y={-8 + row * 12 - col * 6}
            width={4}
            height={5}
            fill={windowFill}
            opacity={
              isActive
                ? 0.95
                : isDark
                  ? 0.4 + Math.random() * 0.3
                  : 0.6 + Math.random() * 0.3
            }
            rx={0.5}
            transform={`skewY(-30)`}
          />
        ))
      )}

      {/* Status indicator circle */}
      <circle
        cx={0}
        cy={-36}
        r={isActive ? 7 : 5}
        fill={
          center.status === "online"
            ? "#10B981"
            : center.status === "maintenance"
              ? "#F59E0B"
              : "#EF4444"
        }
        stroke={statusStroke}
        strokeWidth={2}
      >
        {center.status === "online" && (
          <animate
            attributeName="r"
            values={isActive ? "7;9;7" : "5;6;5"}
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Center label */}
      <text
        x={0}
        y={58}
        textAnchor="middle"
        fill={labelColor}
        fontSize={isActive ? 9.5 : 8}
        fontWeight={isActive ? 850 : 600}
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        {center.name}
      </text>

      {/* Capacity indicator */}
      <text
        x={0}
        y={70}
        textAnchor="middle"
        fill={capacityColor}
        fontSize={7}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {center.capacity}% Capacity
      </text>
    </motion.g>
  );
}

/* ────────────────────────────────────────────
   ConnectionLine — Animated data flow line
   ──────────────────────────────────────────── */
function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
  isActive,
  isDark,
  index,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  isDark: boolean;
  index: number;
}) {
  const gradientId = `flow-gradient-${index}`;
  const lineColor = isDark ? "#00E5FF" : "#0891B2";

  // Midpoint with slight curve
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 15;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;

  return (
    <g>
      {/* Gradient definition */}
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor={lineColor}
            stopOpacity={0.1}
          />
          <stop
            offset="50%"
            stopColor={lineColor}
            stopOpacity={isActive ? 0.8 : 0.3}
          />
          <stop
            offset="100%"
            stopColor={lineColor}
            stopOpacity={0.1}
          />
        </linearGradient>
      </defs>

      {/* Base line */}
      <path
        d={d}
        fill="none"
        stroke={
          isDark
            ? "rgba(0,229,255,0.08)"
            : "rgba(8,145,178,0.1)"
        }
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray="6,4"
      />

      {/* Animated glowing line overlay */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeLinecap="round"
      />

      {/* Animated data packet traveling along the line */}
      <circle
        r={isActive ? 3 : 2}
        fill={lineColor}
        opacity={0.9}
      >
        <animateMotion
          dur={`${2.5 + index * 0.4}s`}
          repeatCount="indefinite"
          path={d}
        />
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur={`${2.5 + index * 0.4}s`}
          repeatCount="indefinite"
        />
      </circle>

      {/* Second packet with offset */}
      <circle
        r={isActive ? 2 : 1.5}
        fill={lineColor}
        opacity={0.5}
      >
        <animateMotion
          dur={`${3 + index * 0.3}s`}
          repeatCount="indefinite"
          path={d}
          begin={`${1.2 + index * 0.2}s`}
        />
      </circle>
    </g>
  );
}

/* ────────────────────────────────────────────
   TelemetrySidebar — Detailed stats for active node
   ──────────────────────────────────────────── */
function TelemetrySidebar({
  center,
  isDark,
}: {
  center: CenterNode;
  isDark: boolean;
}) {
  const config = TYPE_CONFIG[center.type];
  const statusConfig = STATUS_COLORS[center.status];

  const metrics = [
    {
      icon: BarChart3,
      label: "Throughput",
      value: `${center.throughput}`,
      unit: "btl/hr",
      color: isDark ? "text-[#00E5FF]" : "text-[#0891B2]",
    },
    {
      icon: Activity,
      label: "Efficiency",
      value: `${center.efficiency}%`,
      unit: "",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${center.temperature}°C`,
      unit: "",
      color:
        center.temperature > 30
          ? "text-amber-500 dark:text-amber-400"
          : "text-blue-500 dark:text-blue-400",
    },
    {
      icon: Container,
      label: "Capacity",
      value: `${center.capacity}%`,
      unit: "",
      color:
        center.capacity > 80
          ? "text-amber-500 dark:text-amber-400"
          : "text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: Fuel,
      label: "CO₂ Saved",
      value: `${center.co2Saved}`,
      unit: "kg",
      color: "text-green-500 dark:text-green-400",
    },
    {
      icon: Truck,
      label: "Active Drivers",
      value: `${center.activeDrivers}`,
      unit: "",
      color: "text-violet-500 dark:text-violet-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 h-full"
    >
      {/* Active Center Card Header */}
      <div className="bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-[0_4px_12px_rgba(226,232,240,0.4)] dark:shadow-none relative overflow-hidden transition-all duration-300">
        <div className="flex items-center gap-3 mb-3 z-10 relative">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}
          >
            <config.icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              {center.name}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-white/40 font-bold mt-1">
              {center.nameAr}
            </p>
          </div>
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-2 z-10 relative">
          <div
            className={`w-2 h-2 rounded-full ${statusConfig.dot} relative`}
          >
            {center.status === "online" && (
              <span
                className={`absolute inset-0 w-2 h-2 rounded-full ${statusConfig.dot} animate-ping`}
              />
            )}
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/50">
            {statusConfig.label}
          </span>
          <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A1F24] text-slate-500 dark:text-white/40 tracking-wider ml-auto">
            {config.label}
          </span>
        </div>
        {/* Glow */}
        <div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{
            background: isDark ? config.glow : config.glowLight,
          }}
        />
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.25 }}
            className="bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-[#222930] shadow-[0_2px_8px_rgba(241,245,249,0.3)] hover:shadow-[0_4px_12px_rgba(241,245,249,0.5)] transition-all duration-300 group"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <m.icon className="w-3 h-3 text-slate-400 dark:text-white/30 group-hover:text-slate-500 dark:group-hover:text-white/50 transition-colors" />
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/35">
                {m.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-black ${m.color}`}>
                {m.value}
              </span>
              {m.unit && (
                <span className="text-[8px] text-slate-400 dark:text-white/30 font-bold">
                  {m.unit}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Capacity Progress */}
      <div className="bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 shadow-[0_4px_12px_rgba(226,232,240,0.4)] dark:shadow-none transition-all duration-300">
        <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-white/40 mb-2">
          <span>Overall Load</span>
          <span className="text-[#0891B2] dark:text-[#00E5FF]">
            {center.capacity}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${center.capacity}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */
export default function IsometricCentersHub() {
  const [activeCenter, setActiveCenter] =
    useState<string>("C1");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const selectedCenter =
    CENTERS.find((c) => c.id === activeCenter) || CENTERS[0];

  // Convert percentage positions to SVG coordinates
  const SVG_W = 700;
  const SVG_H = 420;

  const getPos = (c: CenterNode) => ({
    x: (c.x / 100) * SVG_W,
    y: (c.y / 100) * SVG_H,
  });

  const accentColor = isDark ? "#00E5FF" : "#0891B2";
  const gridStroke = isDark ? "white" : "black";

  return (
    <div className="bg-white/70 dark:bg-[#0a0e14] backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/[0.06] shadow-[0_8px_32px_rgba(139,94,60,0.07),_0_2px_8px_rgba(139,94,60,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_1px_rgba(0,229,255,0.06)] overflow-hidden w-full transition-all duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/[0.06] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-400 dark:text-white/50">
              Infrastructure Network
            </h3>
            <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
              Recycling Centers Hub
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {Object.entries(TYPE_CONFIG).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center gap-1.5"
            >
              <div
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${val.gradient}`}
              />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/35">
                {val.label}
              </span>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] shadow-[0_2px_8px_rgba(226,232,240,0.3)] dark:shadow-none px-4 py-2 rounded-full transition-all duration-300">
          <motion.div
            className="w-2 h-2 bg-emerald-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.4)",
                "0 0 0 6px rgba(16, 185, 129, 0)",
                "0 0 0 0 rgba(16, 185, 129, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-white/40">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* Main Content: Isometric Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* SVG Isometric Visualization */}
        <div className="lg:col-span-8 p-6 relative min-h-[480px] flex items-center justify-center overflow-hidden">
          {/* Ambient glow effects */}
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Grid pattern background */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.03]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="iso-grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={gridStroke}
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#iso-grid)"
            />
          </svg>

          <svg
            viewBox={`-40 -60 ${SVG_W + 80} ${SVG_H + 100}`}
            className="w-full h-full max-h-[460px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Connection Lines first (under buildings) */}
            {CONNECTIONS.map(([fromId, toId], idx) => {
              const from = CENTERS.find(
                (c) => c.id === fromId,
              )!;
              const to = CENTERS.find((c) => c.id === toId)!;
              const fromPos = getPos(from);
              const toPos = getPos(to);
              const isActive =
                activeCenter === fromId ||
                activeCenter === toId;

              return (
                <ConnectionLine
                  key={`${fromId}-${toId}`}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  isActive={isActive}
                  isDark={isDark}
                  index={idx}
                />
              );
            })}

            {/* Center Buildings */}
            {CENTERS.map((center) => {
              const pos = getPos(center);
              return (
                <g
                  key={center.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                >
                  <IsometricBuilding
                    center={center}
                    isActive={activeCenter === center.id}
                    isDark={isDark}
                    onClick={() => setActiveCenter(center.id)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Telemetry Sidebar */}
        <div className="lg:col-span-4 bg-slate-50/40 dark:bg-[#0a0e14]/50 border-l border-slate-100 dark:border-white/[0.06] p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3 mb-4">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0891B2] dark:text-[#00E5FF]">
              Center Telemetry
            </span>
            <span className="text-[8px] font-bold text-slate-450 dark:text-white/30 uppercase tracking-wider bg-slate-100 dark:bg-[#1A1F24] px-2 py-0.5 rounded-full">
              {selectedCenter.id}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <TelemetrySidebar
              key={selectedCenter.id}
              center={selectedCenter}
              isDark={isDark}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Stats Strip */}
      <div className="border-t border-slate-100 dark:border-white/[0.06] px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {CENTERS.map((c) => {
            const config = TYPE_CONFIG[c.type];
            const statusCfg = STATUS_COLORS[c.status];
            const isActive = activeCenter === c.id;

            return (
              <motion.button
                key={c.id}
                onClick={() => setActiveCenter(c.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? "bg-[#0891B2]/5 dark:bg-[#00E5FF]/[0.07] border-[#0891B2]/20 dark:border-[#00E5FF]/20 dark:shadow-[0_0_15px_rgba(0,229,255,0.06)]"
                    : "bg-white dark:bg-[#1A1F24] border-slate-100 dark:border-white/[0.06] shadow-[0_2px_8px_rgba(226,232,240,0.3)] hover:bg-slate-50/50 hover:shadow-[0_4px_12px_rgba(226,232,240,0.5)]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}
                >
                  <config.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold text-slate-700 dark:text-white/70 uppercase tracking-wider truncate">
                    {c.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                    />
                    <span className="text-[8px] font-bold text-slate-400 dark:text-white/35">
                      {c.efficiency}% eff.
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

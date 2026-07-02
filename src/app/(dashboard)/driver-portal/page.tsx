"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/components/landing/landing-animations.css";
import {
  Package, Route as RouteIcon, Clock, Truck, Bell, ArrowRight,
  MapPin, CheckCircle2, Fuel, Gauge, Navigation, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/store/authStore";
import { usePickup, PickupProvider } from "@/app/contexts/PickupContext";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

/* =========================================================================
 * Driver Overview — the driver's home dashboard.
 *   • Today's pickup count          • Current route
 *   • Today's schedule              • Vehicle status
 *   • Quick notifications           • Jump to Pickups / Routes
 * Vehicle status, schedule and notifications are mocked (no backend yet).
 * ======================================================================= */



const toneMap: Record<string, string> = {
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
  violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
};

export default function DriverOverviewPage() {
  return (
    <PickupProvider>
      <DriverOverviewDashboard />
    </PickupProvider>
  );
}

function DriverOverviewDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data: driverRequests = [] } = useQuery<any[]>({
    queryKey: ["driver-requests-portal", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await api.get(`/PickupRequests/GetRequestsByRecyclerId/${user.id}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fallbackNotifications = [
    { icon: Package, tone: "emerald", text: "New pickup request assigned", time: "2h ago" },
    { icon: AlertTriangle, tone: "amber", text: "Route optimization completed", time: "4h ago" },
    { icon: CheckCircle2, tone: "sky", text: "Profile verification complete", time: "1d ago" },
  ];

  useEffect(() => {
    const fetchDriverNotifications = async () => {
      try {
        const response = await api.get("/Notifications/my-notifications");
        const data = response.data;
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.notifications)) {
          list = data.notifications;
        } else if (data && Array.isArray(data.data)) {
          list = data.data;
        }

        if (list.length > 0) {
          const mapped = list.map((n: any) => {
            const noteType = n.type || n.severity || "info";
            let icon = Package;
            let tone = "sky";
            if (noteType === "success") {
              icon = CheckCircle2;
              tone = "emerald";
            } else if (noteType === "warning") {
              icon = AlertTriangle;
              tone = "amber";
            }
            return {
              icon,
              tone,
              text: n.desc || n.message || n.description || n.title || "",
              time: n.time || n.createdAt || "Just now"
            };
          });
          setNotifications(mapped);
        } else {
          setNotifications(fallbackNotifications);
        }
      } catch (err) {
        console.error("Failed to fetch driver notifications:", err);
        setNotifications(fallbackNotifications);
      }
    };

    if (mounted) {
      fetchDriverNotifications();
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="animate-pulse h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const assigned = driverRequests.filter((r: any) => r.status?.toLowerCase() !== "completed" && r.status?.toLowerCase() !== "verified" && r.status?.toLowerCase() !== "failed" && r.status?.toLowerCase() !== "rejected");
  const completedToday = driverRequests.filter((r: any) => r.status?.toLowerCase() === "completed" || r.status?.toLowerCase() === "verified").length;
  const nextStop = assigned[0];

  const todaySchedule = driverRequests.slice(0, 5).map((r: any) => {
    const timeStr = r.requestDate ? new Date(r.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "09:00 AM";
    return {
      time: timeStr,
      label: `Pickup at ${r.address || "Client location"}`,
      done: r.status?.toLowerCase() === "completed" || r.status?.toLowerCase() === "verified",
    };
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const kpis = [
    { label: "Pickups today", value: assigned.length, sub: `${completedToday} done`, icon: Package, tone: "emerald" },
    { label: "On current route", value: nextStop ? nextStop.zone || "Cairo Route" : "—", sub: "active", icon: RouteIcon, tone: "sky" },
    { label: "Next stop", value: nextStop ? `ORD-${nextStop.requestId || nextStop.id}` : "All clear", sub: nextStop ? nextStop.zone || "Cairo" : "no pending", icon: MapPin, tone: "violet" },
    { label: "Shift ends", value: "16:30", sub: `${assigned.length} stops left`, icon: Clock, tone: "amber" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Hero */}
      <div
        className="animate-fade-in-up rounded-3xl p-6 md:p-8 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm">{greeting},</p>
            <h1 className="text-3xl" style={{ fontWeight: 700 }}>{user?.name ?? "Driver"}</h1>
            <p className="text-white/80 text-sm mt-1">
              You have <strong>{assigned.length}</strong> pickup{assigned.length !== 1 ? "s" : ""} on today’s route.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/pickups")}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-emerald-700 text-sm hover:bg-white/90 transition-colors cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              <Package className="w-4 h-4" /> View Pickups
            </button>
            <button
              onClick={() => router.push("/routes")}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 border border-white/30 text-white text-sm hover:bg-white/25 transition-colors cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              <RouteIcon className="w-4 h-4" /> My Route
            </button>
          </div>
        </div>
        {/* decorative wave */}
        <svg className="absolute inset-x-0 bottom-0 w-full h-20 opacity-30" viewBox="0 0 720 80" preserveAspectRatio="none">
          <path d="M0,50 C150,20 300,70 450,40 C600,15 680,55 720,40 L720,80 L0,80 Z" fill="rgba(255,255,255,0.18)" />
        </svg>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${toneMap[k.tone]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl text-slate-900 dark:text-white truncate" style={{ fontWeight: 700 }}>{k.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{k.label} · <span className="opacity-70">{k.sub}</span></div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-slate-900 dark:text-white flex items-center gap-2" style={{ fontWeight: 700 }}>
              <Clock className="w-4 h-4 text-emerald-500" /> Today’s schedule
            </h2>
            <button onClick={() => router.push("/schedule")} className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer" style={{ fontWeight: 600 }}>
              Full schedule <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {todaySchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                <span className="text-xs font-mono w-12 text-slate-700 dark:text-slate-200">{s.time}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-slate-200 dark:bg-white/10 text-slate-400"}`}>
                  {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                </span>
                <span className={`text-sm ${s.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Vehicle status */}
        <GlassCard className="p-5">
          <h2 className="text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4" style={{ fontWeight: 700 }}>
            <Truck className="w-4 h-4 text-cyan-500" /> Vehicle status
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" style={{ fontWeight: 700 }}>
              ● On the road
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">TRK-204</span>
          </div>
          <div className="space-y-3">
            <VehicleStat icon={Fuel} label="Fuel" value={68} unit="%" tone="emerald" />
            <VehicleStat icon={Gauge} label="Load capacity" value={42} unit="%" tone="sky" />
            <VehicleStat icon={Navigation} label="Distance today" value={37} unit="km" raw tone="violet" />
          </div>
          <button onClick={() => router.push("/fleet")} className="mt-4 w-full text-xs text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-cyan-300 transition-colors cursor-pointer" style={{ fontWeight: 600 }}>
            View on Fleet map <ArrowRight className="w-3 h-3" />
          </button>
        </GlassCard>
      </div>

      {/* Notifications */}
      <GlassCard className="p-5">
        <h2 className="text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3" style={{ fontWeight: 700 }}>
          <Bell className="w-4 h-4 text-amber-500" /> Quick notifications
        </h2>
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${toneMap[n.tone]}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{n.text}</span>
                <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function VehicleStat({ icon: Icon, label, value, unit, tone, raw }: { icon: typeof Fuel; label: string; value: number; unit: string; tone: string; raw?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {label}</span>
        <span className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>{value}{unit}</span>
      </div>
      {!raw && (
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div className={`h-full rounded-full ${toneMap[tone].split(" ").find((c) => c.startsWith("bg-")) ?? "bg-emerald-500/40"}`} style={{ width: `${value}%` }} />
        </div>
      )}
    </div>
  );
}

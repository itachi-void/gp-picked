"use client";

import { useState, useEffect, useMemo } from "react";
import "@/app/components/motion/motion-components.css";
import {
  Map as MapIcon,
  Truck,
  AlertTriangle,
  Activity,
  Fuel,
  Navigation,
  Pause,
  WifiOff,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

// Dynamic import of Leaflet LiveMap component to bypass SSR window undefined error
const LiveMap = dynamic(() => import("./components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex flex-col items-center justify-center bg-slate-100 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-2xl gap-3">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading interactive map tiles...</p>
    </div>
  ),
});

type TruckStatus = "en-route" | "idle" | "offline";

interface FleetTruck {
  id: string;
  driver: string;
  status: TruckStatus;
  zone: string;
  fuel: number | string;
  nextStop: string;
  lat: number;
  lng: number;
}

interface GeofenceAlert {
  id: string;
  truckId: string;
  driver: string;
  zone: string;
  time: string;
  severity: "high" | "medium" | "low";
}

function generateAlerts(trucks: FleetTruck[]): GeofenceAlert[] {
  const alerts: GeofenceAlert[] = [];
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  trucks.forEach((t, idx) => {
    if (t.status === "offline") {
      alerts.push({
        id: `GFA-OFF-${idx}`,
        truckId: t.id,
        driver: t.driver,
        zone: t.zone,
        time: fmt(new Date(now.getTime() - idx * 300000)),
        severity: "high",
      });
    } else if (t.status === "idle") {
      alerts.push({
        id: `GFA-IDL-${idx}`,
        truckId: t.id,
        driver: t.driver,
        zone: t.zone,
        time: fmt(new Date(now.getTime() - idx * 600000)),
        severity: "medium",
      });
    }
  });

  if (alerts.length === 0 && trucks.length > 0) {
    alerts.push({
      id: "GFA-OK",
      truckId: trucks[0].id,
      driver: trucks[0].driver,
      zone: trucks[0].zone,
      time: fmt(now),
      severity: "low",
    });
  }

  return alerts;
}

const statusConfig: Record<TruckStatus, { label: string; dot: string; chip: string; icon: any }> = {
  "en-route": {
    label: "En route",
    dot: "#10b981",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    icon: Navigation,
  },
  idle: {
    label: "Idle",
    dot: "#f59e0b",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    icon: Pause,
  },
  offline: {
    label: "Offline",
    dot: "#94a3b8",
    chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    icon: WifiOff,
  },
};

const normalizeStatus = (status: string): TruckStatus => {
  const s = String(status || "").toLowerCase();
  if (s.includes("active") || s.includes("a5oya") || s.includes("route")) return "en-route";
  if (s.includes("available") || s.includes("compete") || s.includes("free") || s.includes("idle")) return "idle";
  return "offline";
};

export default function FleetMapPage() {
  const router = useRouter();
  const { role } = useRoleContext();
  const currentRole = role?.toLowerCase() ?? "citizen";
  const [trucks, setTrucks] = useState<FleetTruck[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TruckStatus>("all");
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isLoading: loading, refetch } = useQuery<FleetTruck[]>({
    queryKey: ["fleet-trucks"],
    queryFn: async () => {
      const res = await api.get("/admin/recyclers-details");
      const list = Array.isArray(res.data) ? res.data : [];
      
      const mappedPromises = list.map(async (d: any, idx: number) => {
        const driverId = String(d.recyclerID || d.id || `TRK-${idx}`);
        
        // Cairo center-based default coordinates
        const baseLat = 30.0444;
        const baseLng = 31.2357;
        const latOffset = ((idx * 17) % 50 - 25) * 0.0018;
        const lngOffset = ((idx * 23) % 50 - 25) * 0.0018;
        
        let zone = "not yet from api";
        let nextStop = "not yet from api";
        
        // Asynchronously fetch pickup requests for this driver to populate zone and nextStop dynamically from API
        try {
          const reqRes = await api.get(`/PickupRequests/GetRequestsByRecyclerId/${driverId}`);
          if (Array.isArray(reqRes.data) && reqRes.data.length > 0) {
            const activeReq = reqRes.data.find(
              (r: any) =>
                r.status?.toLowerCase() === "pending" ||
                r.status?.toLowerCase() === "accepted" ||
                r.status?.toLowerCase() === "enroute"
            ) || reqRes.data[0];
            
            if (activeReq) {
              zone = activeReq.zone || "Cairo Zone";
              nextStop = activeReq.address || "Hub Terminal";
            }
          }
        } catch (e) {
          // No requests or failed, keep defaults
        }

        return {
          id: driverId,
          driver: d.fullName || "Driver",
          status: normalizeStatus(d.status),
          zone,
          fuel: "not yet from api",
          nextStop,
          lat: baseLat + latOffset,
          lng: baseLng + lngOffset,
        };
      });

      const result = await Promise.all(mappedPromises);
      setTrucks(result);
      return result;
    },
  });

  // EventSource stream connection for live selected driver location tracking
  useEffect(() => {
    if (!selectedTruck) return;
    
    // Connect directly to the public SSE stream on the smartwaste backend
    const streamUrl = `https://smartwaste.runasp.net/api/LiveMap/truck-stream/${selectedTruck}`;
    const es = new EventSource(streamUrl);
    
    es.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const lat = Number(raw.Latitude || raw.latitude);
        const lng = Number(raw.Longitude || raw.longitude);
        const capacity = raw.Capacity !== undefined ? raw.Capacity : raw.capacity;
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setTrucks((prev) =>
            prev.map((t) => {
              if (t.id === selectedTruck) {
                return {
                  ...t,
                  lat,
                  lng,
                  fuel: capacity !== undefined ? `${capacity}%` : t.fuel,
                };
              }
              return t;
            })
          );
        }
      } catch (err) {
        console.error("Error parsing event stream data:", err);
      }
    };
    
    es.onerror = (err) => {
      console.warn(`EventSource connection warning for driver ${selectedTruck}:`, err);
    };
    
    return () => {
      es.close();
    };
  }, [selectedTruck]);

  // Telemetry simulation for unselected active trucks to keep the map alive
  useEffect(() => {
    const timer = setInterval(() => {
      setTrucks((prev) =>
        prev.map((t) => {
          if (t.status === "offline" || t.id === selectedTruck) return t;
          const nlat = t.lat + (Math.random() * 0.0004 - 0.0002);
          const nlng = t.lng + (Math.random() * 0.0004 - 0.0002);
          return { ...t, lat: nlat, lng: nlng };
        })
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedTruck]);

  const filtered = useMemo(() => {
    return trucks.filter((t) => {
      const matchesQuery =
        !query ||
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.driver.toLowerCase().includes(query.toLowerCase()) ||
        t.zone.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, trucks]);

  const geofenceAlerts = useMemo(() => generateAlerts(filtered), [filtered]);

  const kpis = [
    {
      label: "Active Trucks",
      value: trucks.length,
      icon: Truck,
      accent: "emerald",
    },
    {
      label: "On Route",
      value: trucks.filter((t) => t.status === "en-route").length,
      icon: Navigation,
      accent: "teal",
    },
    {
      label: "Idle",
      value: trucks.filter((t) => t.status === "idle").length,
      icon: Pause,
      accent: "amber",
    },
    {
      label: "Geofence Breaches",
      value: geofenceAlerts.length,
      icon: ShieldAlert,
      accent: "rose",
    },
  ];

  const severityChip: Record<GeofenceAlert["severity"], string> = {
    high: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    low: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Pinging fleet telemetry…");
    await refetch();
    setIsRefreshing(false);
    toast.success("Fleet positions updated");
  };

  if (currentRole === "citizen" || currentRole === "user") {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <GlassCard className="flex flex-col items-center justify-center text-center p-16 gap-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
            <MapIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
            Fleet Map Restricted
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            Live fleet telemetry is available for operations staff only.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <MapIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Fleet Map</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Live geographic view of every truck, drop-off, and active request
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Live
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors disabled:opacity-50 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const a = accentMap[kpi.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" };
          return (
            <div
              key={kpi.label}
              className="mc-card-in hover-lift"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <h3 className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</h3>
                <p
                  className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1"
                  style={{ fontWeight: 600 }}
                >
                  {kpi.value}
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium">Fetching active fleet telemetry...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div
            className="mc-slide-from-left xl:col-span-2"
            style={{ animationDelay: "0.2s" }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                    Live Telemetry
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> En route
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Idle
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Offline
                  </span>
                </div>
              </div>

              <LiveMap
                trucks={filtered}
                selectedTruckId={selectedTruck}
                onSelectTruck={(id) => setSelectedTruck(id)}
              />

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Activity className="w-3.5 h-3.5" />
                Live geographic view centered in Cairo, Egypt. Click a marker pin for details.
              </div>
            </GlassCard>
          </div>

          <div
            className="mc-slide-from-right"
            style={{ animationDelay: "0.3s" }}
          >
            <GlassCard className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Fleet Roster</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {filtered.length} of {trucks.length} trucks
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search truck, driver, zone…"
                    className="w-full pl-9 pr-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="en-route">En route</option>
                  <option value="idle">Idle</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1" style={{ maxHeight: 480 }}>
                {filtered.map((t, index) => {
                  const cfg = statusConfig[t.status];
                  const StatusIcon = cfg.icon;
                  const isSelected = selectedTruck === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTruck(t.id)}
                      className={`mc-fade-in-right hover-shift-x p-3 rounded-2xl cursor-pointer border transition-colors ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30"
                      }`}
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cfg.dot }}
                          />
                          <span
                            className="text-sm text-slate-900 dark:text-white truncate"
                            style={{ fontWeight: 600 }}
                          >
                            {t.id}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 h-6 inline-flex items-center gap-1 rounded-full border ${cfg.chip}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{t.driver}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t.zone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3 h-3" />
                          {t.fuel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Next: {t.nextStop}
                      </p>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 p-6">
                    No trucks match.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      <div
        className="mc-fade-in-up"
        style={{ animationDelay: "0.4s" }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Recent Geofence Alerts
              </h3>
            </div>
            <button
              onClick={() => router.push("/alerts")}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Configure
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Drivers leaving their assigned zones
          </p>

          <div className="space-y-2">
            {geofenceAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className="mc-card-in hover-shift-x flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl cursor-pointer"
                style={{ animationDelay: `${0.5 + index * 0.05}s` }}
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4
                      className="text-sm text-slate-900 dark:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {alert.truckId} · {alert.driver}
                    </h4>
                    <span
                      className={`text-xs px-2 h-6 inline-flex items-center rounded-full border ${severityChip[alert.severity]}`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{alert.zone}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

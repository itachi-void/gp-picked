"use client";

import { useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import { ClipboardList, Search, Filter, X, Truck, Users, MapPin, AlertTriangle, Settings, Package, RefreshCw, Loader2, Plus } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import api from "@/lib/axios";

type Category = "route" | "driver" | "citizen" | "system" | "alert" | "collection";
type Severity = "low" | "medium" | "high";
type UserRole = "admin" | "driver" | "citizen" | "system";

interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  userRole: UserRole;
  target: string;
  details: string;
  category: Category;
  severity: Severity;
  timestamp: Date;
}

const categoryAccent: Record<Category, { icon: any; bg: string; fg: string; label: string }> = {
  route: { icon: MapPin, bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400", label: "Route" },
  driver: { icon: Truck, bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", label: "Driver" },
  citizen: { icon: Users, bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400", label: "Citizen" },
  system: { icon: Settings, bg: "bg-slate-500/10", fg: "text-slate-600 dark:text-slate-300", label: "System" },
  alert: { icon: AlertTriangle, bg: "bg-rose-500/10", fg: "text-rose-600 dark:text-rose-400", label: "Alert" },
  collection: { icon: Package, bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", label: "Collection" },
};

const severityAccent: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const roleAccent: Record<UserRole, string> = {
  admin: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  driver: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  citizen: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  system: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString();
}

export default function ActivityLogPage() {
  useRoleContext();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [severity, setSeverity] = useState<"all" | Severity>("all");

  const fetchLogs = async () => {
    setLoading(true);
    const aggregatedLogs: ActivityEntry[] = [];

    try {
      // 1. Fetch Users
      try {
        const resUsers = await api.get("/admin/list-users-for-admin");
        const users = resUsers.data || [];
        users.forEach((u: any) => {
          const rawRole = String(u.role || "").toLowerCase();
          const mappedRole: UserRole = (rawRole === "driver" || rawRole === "recycler") 
            ? "driver" 
            : (rawRole === "admin" || rawRole === "manager") 
              ? "admin" 
              : "citizen";

          aggregatedLogs.push({
            id: `usr-${u.userId || Math.random()}`,
            action: `${u.role || "Citizen"} Registration`,
            user: u.fullName || "Eco Citizen",
            userRole: mappedRole,
            target: u.email || "No Email Provided",
            details: `Registered account from ${u.address || "Unknown address"}. Contact: ${u.phone || "No phone"}`,
            category: mappedRole === "driver" ? "driver" : "citizen",
            severity: "low",
            timestamp: u.joinDate ? new Date(u.joinDate) : new Date(Date.now() - 5 * 24 * 3600 * 1000),
          });
        });
      } catch (err) {
        console.error("Failed to load users for activity log:", err);
      }

      // 2. Fetch Support Tickets
      try {
        const resTickets = await api.get("/admin/list-tickets-for-admin");
        const tickets = resTickets.data || [];
        tickets.forEach((t: any) => {
          const rawPriority = String(t.priority || "").toLowerCase();
          const mappedSeverity: Severity = rawPriority === "high" 
            ? "high" 
            : rawPriority === "medium" 
              ? "medium" 
              : "low";

          aggregatedLogs.push({
            id: `tkt-${t.id || Math.random()}`,
            action: `Support Ticket: ${t.status || "Pending"}`,
            user: t.citizenName || "Citizen User",
            userRole: "citizen",
            target: t.subject || "No Subject",
            details: `Ticket Category: ${t.category || "Inquiry"}. Assigned Driver: ${t.driverName || "None"}. Description: ${t.description || ""}`,
            category: mappedSeverity === "high" ? "alert" : "citizen",
            severity: mappedSeverity,
            timestamp: t.createdAt ? new Date(t.createdAt) : new Date(Date.now() - 2 * 24 * 3600 * 1000),
          });
        });
      } catch (err) {
        console.error("Failed to load tickets for activity log:", err);
      }

      // 3. Fetch Pending Requests
      try {
        const resPending = await api.get("/PickupRequests/GetPendingRequestForms");
        const pending = resPending.data || [];
        pending.forEach((p: any) => {
          aggregatedLogs.push({
            id: `req-${p.transactionId || Math.random()}`,
            action: "Pickup Request Form",
            user: p.userName || "Citizen User",
            userRole: "citizen",
            target: `Transaction #${p.transactionId || "—"}`,
            details: `Plastic Type: ${p.plasticType || "PET"}. Expected Weight: ${p.expectedWeightKg || 0} kg. Expected Quantity: ${p.expectedQuantity || 0} bottles.`,
            category: "collection",
            severity: "low",
            timestamp: p.requestDate ? new Date(p.requestDate) : new Date(Date.now() - 3600 * 1000),
          });
        });
      } catch (err) {
        console.error("Failed to load pending requests for activity log:", err);
      }

      // Sort logs by date descending
      aggregatedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setActivities(aggregatedLogs);
    } catch (err) {
      console.error("Failed to aggregate logs:", err);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = activities.filter((a) => {
    const ms =
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.target.toLowerCase().includes(search.toLowerCase()) ||
      a.details.toLowerCase().includes(search.toLowerCase());
    return ms && (category === "all" || a.category === category) && (severity === "all" || a.severity === severity);
  });

  const simulate = () => {
    const sample: ActivityEntry = {
      id: String(Date.now()),
      action: "Route Auto-assigned",
      user: "System Daemon",
      userRole: "system",
      target: "RT-007 Zamalek",
      details: "Route automatically assigned to nearest available driver",
      category: "route",
      severity: "medium",
      timestamp: new Date(),
    };
    setActivities((p) => [sample, ...p]);
    toast.success("Simulated Event Logged locally");
  };

  const stats = [
    { label: "Total Events", value: activities.length, accent: "emerald" },
    { label: "High Severity", value: activities.filter((a) => a.severity === "high").length, accent: "rose" },
    { label: "Today", value: activities.filter((a) => Date.now() - a.timestamp.getTime() < 86400000).length, accent: "teal" },
    { label: "System Events", value: activities.filter((a) => a.userRole === "system").length, accent: "violet" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Activity Log</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Complete record of system events and actions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} className="flex items-center gap-2 px-4 h-10 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 rounded-full transition-colors text-sm cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={simulate} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            Simulate Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium text-lg">Aggregating system events from database...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const a = accentMap[s.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" };
              return (
                <div key={s.label} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
                  <GlassCard className="p-5">
                    <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center mb-3`}>
                      <div className={`w-3 h-3 rounded-full ${a.fg.includes("emerald") ? "bg-emerald-500" : a.fg.includes("rose") ? "bg-rose-500" : a.fg.includes("teal") ? "bg-teal-500" : "bg-violet-500"}`} />
                    </div>
                    <p className="text-2xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{s.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          <GlassCard className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, users, targets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Category:</span>
              {(["all", "route", "driver", "citizen", "alert", "system", "collection"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 h-8 rounded-full text-xs capitalize transition-colors cursor-pointer ${
                    category === c
                      ? "bg-emerald-600 text-white"
                      : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Severity:</span>
              {(["all", "low", "medium", "high"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`px-3 h-8 rounded-full text-xs capitalize transition-colors cursor-pointer ${
                    severity === s
                      ? "bg-emerald-600 text-white"
                      : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Events ({filtered.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
              <>
                {filtered.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      Icon={ClipboardList}
                      title="No events match your filters"
                      description="Clear filters or wait for new activity to be recorded."
                    />
                  </div>
                ) : (
                  filtered.map((e, i) => {
                    const cat = categoryAccent[e.category] || { icon: ClipboardList, bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", label: "Event" };
                    const CatIcon = cat.icon;
                    return (
                      <div
                        key={e.id}
                        className="mc-slide-from-left flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                        style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
                      >
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${cat.bg} ${cat.fg}`}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{e.action}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${severityAccent[e.severity] || "bg-slate-100 text-slate-600"}`}>{e.severity}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Target: <span className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>{e.target}</span>
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{e.details}</p>
                            </div>
                            <p className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{timeAgo(e.timestamp)}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${roleAccent[e.userRole] || "bg-slate-100 text-slate-600"}`}>{e.userRole}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{e.user}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}

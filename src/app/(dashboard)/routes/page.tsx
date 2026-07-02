"use client";

import { useMemo, useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import { Search, Plus, Eye, Edit, Trash2, MapPin, X, Route as RouteIcon, Truck, Clock, Loader2 } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import api from "@/lib/axios";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type RouteStatus = "active" | "completed" | "scheduled";

interface Route {
  id: string;
  name: string;
  driver: string;
  stops: number | string;
  distance: string;
  duration: string;
  status: RouteStatus;
}

const emptyForm: Omit<Route, "id"> = { name: "", driver: "", stops: 0, distance: "0 km", duration: "0 mins", status: "scheduled" };

const statusAccent: Record<RouteStatus, { bg: string; fg: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  completed: { bg: "bg-sky-500/10", fg: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  scheduled: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};

const normalizeStatus = (status: string): RouteStatus => {
  const s = String(status || "").toLowerCase();
  if (s.includes("active") || s.includes("a5oya") || s.includes("route")) return "active";
  if (s.includes("available") || s.includes("compete") || s.includes("free") || s.includes("idle")) return "scheduled";
  return "completed";
};

export default function RoutesPage() {
  const { role } = useRoleContext();
  const currentRole = role?.toLowerCase() ?? "citizen";
  const { addNotification } = useNotifications();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RouteStatus>("all");
  const [viewing, setViewing] = useState<Route | null>(null);
  const [editing, setEditing] = useState<Route | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Route, "id">>(emptyForm);

  const canManage = !(currentRole === "citizen" || currentRole === "driver" || currentRole === "recycler");

  const { data: rawDrivers = [], isLoading: driversLoading } = useQuery<any[]>({
    queryKey: ["recyclers-details"],
    queryFn: async () => {
      const res = await api.get("/admin/recyclers-details");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const stopsQueries = useQueries({
    queries: rawDrivers.map((d: any, idx: number) => {
      const driverId = String(d.recyclerID || d.id || `TRK-${idx}`);
      return {
        queryKey: ["driver-requests", driverId],
        queryFn: async () => {
          const res = await api.get(`/PickupRequests/GetRequestsByRecyclerId/${driverId}`);
          return Array.isArray(res.data) ? res.data : [];
        },
      };
    }),
  });

  const loading = driversLoading || stopsQueries.some((q) => q.isLoading);

  const stopsQueryDataString = JSON.stringify(
    stopsQueries.map((q) => ({
      status: q.status,
      dataLength: Array.isArray(q.data) ? q.data.length : 0,
      firstZone: Array.isArray(q.data) ? q.data.find((r: any) => r.zone)?.zone : undefined,
      pendingOrEnRoute: Array.isArray(q.data) ? q.data.some(
        (r: any) =>
          r.status?.toLowerCase() === "pending" ||
          r.status?.toLowerCase() === "accepted" ||
          r.status?.toLowerCase() === "enroute"
      ) : false,
    }))
  );

  const fetchedRoutes = useMemo(() => {
    if (rawDrivers.length === 0) return [];
    
    const queryData = JSON.parse(stopsQueryDataString);

    return rawDrivers.map((d: any, idx: number) => {
      const driverId = String(d.recyclerID || d.id || `TRK-${idx}`);
      const driverName = d.fullName || "Driver";
      
      let stops = 4;
      let status: RouteStatus = normalizeStatus(d.status);
      let zoneName = `${driverName}'s Route`;

      const qResult = queryData[idx];
      if (qResult && qResult.status === "success") {
        stops = qResult.dataLength;
        if (qResult.pendingOrEnRoute) {
          status = "active";
        } else if (stops > 0) {
          status = "completed";
        }
        
        if (qResult.firstZone) {
          zoneName = `${qResult.firstZone} Area`;
        }
      }

      const distanceVal = "not yet from api";
      const durationVal = "not yet from api";

      return {
        id: driverId,
        name: zoneName,
        driver: driverName,
        stops,
        distance: distanceVal,
        duration: durationVal,
        status,
      };
    });
  }, [rawDrivers, stopsQueryDataString]);

  useEffect(() => {
    if (fetchedRoutes && fetchedRoutes.length > 0) {
      setRoutes(fetchedRoutes);
    }
  }, [fetchedRoutes]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return routes.filter((r) => {
      const mq = !q || r.name.toLowerCase().includes(q) || r.driver.toLowerCase().includes(q) || r.id.includes(q);
      const ms = statusFilter === "all" || r.status === statusFilter;
      return mq && ms;
    });
  }, [routes, searchQuery, statusFilter]);

  const ITEMS_PER_PAGE = 9;
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRoutes = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleDelete = (route: Route) => {
    setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    toast.success(`Route ${route.name} deleted locally`);
    addNotification({ title: "Route deleted", body: `Route ${route.name} (#${route.id}) was removed.`, severity: "warning", icon: "Route", link: "/routes" });
  };

  const openCreate = () => { setForm(emptyForm); setCreating(true); };
  const openEdit = (r: Route) => {
    setForm({ name: r.name, driver: r.driver, stops: r.stops, distance: r.distance, duration: r.duration, status: r.status });
    setEditing(r);
  };

  const handleSubmitCreate = () => {
    if (!form.name.trim() || !form.driver.trim()) { toast.error("Please fill route name and driver"); return; }
    const nextId = String(Math.max(...routes.map((r) => Number(r.id) || 100), 100) + 1);
    setRoutes((prev) => [{ id: nextId, ...form }, ...prev]);
    setCreating(false); setForm(emptyForm);
    toast.success("Route created locally");
    addNotification({ title: "Route created", body: `${form.name} assigned to ${form.driver}.`, severity: "success", icon: "Route", link: "/routes" });
  };

  const handleSubmitEdit = () => {
    if (!editing) return;
    if (!form.name.trim() || !form.driver.trim()) { toast.error("Please fill route name and driver"); return; }
    setRoutes((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)));
    setEditing(null); setForm(emptyForm);
    toast.success("Route updated locally");
    addNotification({ title: "Route updated", body: `${form.name} details saved.`, severity: "success", icon: "Route", link: "/routes" });
  };

  const stats = [
    { label: "Total Routes", value: routes.length, icon: RouteIcon, accent: "emerald" },
    { label: "Active", value: routes.filter((r) => r.status === "active").length, icon: Truck, accent: "teal" },
    { label: "Scheduled", value: routes.filter((r) => r.status === "scheduled").length, icon: Clock, accent: "amber" },
    { label: "Completed", value: routes.filter((r) => r.status === "completed").length, icon: MapPin, accent: "sky" },
  ];

  const inputCls = "w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <RouteIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Routes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage collection routes</p>
          </div>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer font-bold">
            <Plus className="w-4 h-4" />
            New Route
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon; 
          const a = accentMap[s.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" };
          return (
            <div key={s.label} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>{s.value}</p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <GlassCard className="p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </GlassCard>

      {driversLoading && routes.length === 0 ? (
        <div className="flex items-center justify-center min-h-[250px]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium">Fetching active routes database...</p>
          </div>
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left">
                  {["Route", "Driver", "Stops", "Distance", "Duration", "Status", "Actions"].map((h) => (
                    <th key={h} className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">No routes match your filters.</td></tr>
                )}
                {paginatedRoutes.map((route) => {
                  const sa = statusAccent[route.status] || statusAccent.scheduled;
                  return (
                    <tr key={route.id} className="border-b last:border-0 border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-sm" style={{ fontWeight: 600 }}>
                            #{route.id}
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{route.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Route #{route.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold" style={{ fontWeight: 600 }}>
                            {route.driver.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="text-slate-700 dark:text-slate-200">{route.driver}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span style={{ fontWeight: 600 }}>{route.stops}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{route.distance}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{route.duration}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${sa.bg} ${sa.fg} font-semibold`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${sa.dot}`} />
                          <span className="capitalize">{route.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewing(route)} className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button onClick={() => openEdit(route)} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(route)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/[0.04] border-t border-slate-200 dark:border-white/10 gap-4 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-3 select-none">
                    Page {page} of {totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </GlassCard>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Route #{viewing.id} — {viewing.name}</h2>
              <button onClick={() => setViewing(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Driver", viewing.driver],
                ["Stops", String(viewing.stops)],
                ["Distance", viewing.distance],
                ["Duration", viewing.duration],
                ["Status", viewing.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <span className="text-slate-500 dark:text-slate-400">{k}</span>
                  <span className="text-slate-900 dark:text-white capitalize font-bold" style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewing(null)} className="mt-6 w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors cursor-pointer font-bold">
              Close
            </button>
          </div>
        </div>
      )}

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setCreating(false); setEditing(null); }}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{editing ? `Edit Route #${editing.id}` : "New Route"}</h2>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <Field>
                <FieldLabel>Route Name</FieldLabel>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
              </Field>
              <Field>
                <FieldLabel>Driver</FieldLabel>
                <input value={form.driver} onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))} className={inputCls} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field>
                  <FieldLabel>Stops</FieldLabel>
                  <input type="number" min={0} value={String(form.stops)} onChange={(e) => setForm((f) => ({ ...f, stops: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) }))} className={inputCls} />
                </Field>
                <Field>
                  <FieldLabel>Distance</FieldLabel>
                  <input placeholder="45.2 km" value={form.distance} onChange={(e) => setForm((f) => ({ ...f, distance: e.target.value }))} className={inputCls} />
                </Field>
                <Field>
                  <FieldLabel>Duration</FieldLabel>
                  <input placeholder="3h 20min" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} className={inputCls} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RouteStatus }))} className={inputCls + " cursor-pointer"}>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                Cancel
              </button>
              <button onClick={editing ? handleSubmitEdit : handleSubmitCreate} className="px-5 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer font-bold">
                {editing ? "Save Changes" : "Create Route"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

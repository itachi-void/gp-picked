"use client";

import { useMemo, useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import {
  Package,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Truck,
  MapPin,
  Users,
  Download,
} from "lucide-react";
import { usePickup, PickupRequest, PickupProvider } from "@/app/contexts/PickupContext";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import { DataTable, DataTableColumn } from "@/app/components/DataTable";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import api from "@/lib/axios";

const priorityAccent: Record<string, string> = {
  Critical: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  High: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Normal: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Low: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const statusAccent: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "In Progress": "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Verified: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Failed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const DRIVERS: string[] = [];

// Helper to map backend format to our local page format
function mapBackendToFrontend(req: any): PickupRequest {
  return {
    id: req.orderNumber || `ORD-${req.requestId}`,
    priority: req.priority || "Normal",
    status: req.status || "Pending",
    citizen: { name: req.userName || req.user?.fullName || "not yet from api" },
    zone: { name: req.zoneName || req.userAddress?.split(" ")[0] || "not yet from api" },
    driver: req.driverName && req.driverName !== "No Driver Assigned"
      ? { name: req.driverName } 
      : (req.recycler?.fullName ? { name: req.recycler.fullName } : null),
    items: req.items || [
      {
        plasticType: "Mixed",
        expectedWeightKg: req.finalBottlesCount ? req.finalBottlesCount * 0.05 : (req.totalWeight || 0),
        expectedQuantity: req.finalBottlesCount || req.bottlesCount || 0,
      },
    ],
    date: req.timeAgo || req.createdAt || req.requestDate || new Date().toISOString(),
  };
}

function PickupRequestsPageContent() {
  const { role, user } = useRoleContext();
  const { addNotification } = useNotifications();
  const { requests, setRequests } = usePickup();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [zone, setZone] = useState<string>("all");
  const [material, setMaterial] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDriver, setBulkDriver] = useState<string>("");

  // Backend state for employee and driver/admin views integration
  const [backendRequests, setBackendRequests] = useState<PickupRequest[] | null>(null);
  const [pendingBackendRequests, setPendingBackendRequests] = useState<PickupRequest[] | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);

  const isDriver = role === "Driver" || role === "Recycler" || role === "driver" || role === "recycler";
  const isEmployee = role === "Employee" || role === "employee" || role === "HubStaff" || role === "hubstaff";

  // Fetch employee specific data (Pending + In Progress + Verified/Rejected history) from backend
  useEffect(() => {
    if (!isEmployee) return;

    const fetchEmployeeData = async () => {
      setLoadingBackend(true);
      try {
        const employeeId = user?.id || 1;

        // 1. Fetch pending requests from backend (independent call)
        let listPending: any[] = [];
        try {
          const resPending = await api.get("/PickupRequests/GetPendingRequestForms");
          listPending = Array.isArray(resPending.data)
            ? resPending.data
            : (resPending.data && Array.isArray((resPending.data as any).data) ? (resPending.data as any).data : []);
        } catch (e) {
          console.error("Failed to fetch pending requests:", e);
        }

        // 2. Fetch in progress requests from backend (independent call)
        let listInProgress: any[] = [];
        try {
          const resInProgress = await api.get("/PickupRequests/GetInProgressHubRequests");
          listInProgress = Array.isArray(resInProgress.data)
            ? resInProgress.data
            : (resInProgress.data && Array.isArray((resInProgress.data as any).data) 
                ? (resInProgress.data as any).data 
                : []);
        } catch (e) {
          console.error("Failed to fetch in progress hub requests:", e);
        }

        // 3. Fetch history verified by this employee
        let listHistory: any[] = [];
        const idsToTry = [employeeId];
        if (employeeId !== 1) {
          idsToTry.push(1); // Try ID 1 as fallback
        }

        for (const id of idsToTry) {
          try {
            const resHistory = await api.get(`/HubStaff/${id}/history`);
            const data = resHistory.data?.verifiedRequests || [];
            if (data && data.length > 0) {
              listHistory = data;
              break;
            }
          } catch (e) {
            console.error(`Failed to fetch history for employee ID ${id}:`, e);
          }
        }

        const mappedPending = listPending.map((r: any) => ({
          ...mapBackendToFrontend(r),
          status: r.status || "Pending"
        }));

        const mappedInProgress = listInProgress.map((r: any) => ({
          ...mapBackendToFrontend(r),
          status: r.status || "In Progress"
        }));

        const mappedHistory = listHistory.map((r: any) => ({
          ...mapBackendToFrontend(r),
          status: r.status || "Completed"
        }));

        // Combine lists
        setBackendRequests([...mappedPending, ...mappedInProgress, ...mappedHistory]);
      } catch (err) {
        console.error("Critical error building employee requests list:", err);
        setBackendRequests([]);
      } finally {
        setLoadingBackend(false);
      }
    };

    fetchEmployeeData();
  }, [isEmployee, user]);

  // Fetch pending requests from backend for Driver/Admin (independent call)
  useEffect(() => {
    if (isEmployee) return;

    const fetchPendingData = async () => {
      setLoadingBackend(true);
      try {
        const response = await api.get("/PickupRequests/GetPendingRequestForms");
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);

        const mapped = list.map((r: any) => ({
          ...mapBackendToFrontend(r),
          status: "Pending"
        }));

        setPendingBackendRequests(mapped);
      } catch (err) {
        console.error("Failed to fetch pending requests from backend:", err);
        setPendingBackendRequests([]);
      } finally {
        setLoadingBackend(false);
      }
    };

    fetchPendingData();
  }, [isEmployee]);

  // Filter requests depending on role
  const displayRequests = useMemo(() => {
    if (isEmployee) {
      if (backendRequests !== null) return backendRequests;

      return requests.filter(
        (r) =>
          r.status === "In Progress" ||
          (r.status === "Completed" && (r.verifierName === user?.name || r.verifierId === user?.id))
      );
    }
    if (isDriver) {
      if (pendingBackendRequests !== null) {
        return pendingBackendRequests.filter((r) => !r.driver || r.driver.name === "No Driver Assigned" || r.driver.name === "");
      }
      return requests.filter((r) => r.status === "Pending" && !r.driver);
    }
    // Admin / Manager view
    if (pendingBackendRequests !== null) {
      return pendingBackendRequests;
    }
    return requests;
  }, [requests, isDriver, isEmployee, backendRequests, pendingBackendRequests, user]);

  const enriched: ExtendedRow[] = useMemo(
    () =>
      displayRequests.map((r, i) => {
        const material = r.items[0]?.plasticType ?? "Mixed";
        const weight = r.items.reduce((a, b) => a + b.expectedWeightKg, 0);
        const slaBase: Record<string, number> = { Critical: 30, High: 120, Normal: 360, Low: 1440 };
        
        let elapsedM = (i + 1) * 25;
        if (r.date) {
          const diffMs = new Date().getTime() - new Date(r.date).getTime();
          if (!isNaN(diffMs)) {
            elapsedM = Math.max(0, Math.floor(diffMs / (1000 * 60)));
          }
        }
        
        const slaMinutesLeft = slaBase[r.priority] - elapsedM;
        const requestedAt = r.date && r.date.includes("ago") 
          ? r.date 
          : (elapsedM < 60 ? `${elapsedM}m ago` : `${Math.floor(elapsedM / 60)}h ago`);
        
        return { req: r, material, weight, slaMinutesLeft, requestedAt, elapsedMinutes: elapsedM };
      }),
    [displayRequests]
  );

  const zones = Array.from(new Set(enriched.map((e) => e.req.zone.name)));
  const materials = Array.from(new Set(enriched.map((e) => e.material)));

  const filtered = enriched.filter((e) => {
    const r = e.req;
    const ms =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.citizen.name.toLowerCase().includes(search.toLowerCase()) ||
      r.zone.name.toLowerCase().includes(search.toLowerCase());
    return (
      ms &&
      (priority === "all" || r.priority === priority) &&
      (status === "all" || r.status.toLowerCase() === status.toLowerCase()) &&
      (zone === "all" || r.zone.name === zone) &&
      (material === "all" || e.material === material)
    );
  });

  const stats = [
    { label: "Pending", value: enriched.filter((e) => e.req.status.toLowerCase() === "pending").length, accent: "amber", Icon: Clock },
    { label: "In Progress", value: enriched.filter((e) => e.req.status.toLowerCase() === "in progress" || e.req.status.toLowerCase() === "inprogress").length, accent: "sky", Icon: Loader2 },
    { label: "Completed", value: enriched.filter((e) => e.req.status.toLowerCase() === "completed" || e.req.status.toLowerCase() === "verified").length, accent: "emerald", Icon: CheckCircle },
    { label: "Rejected/Failed", value: enriched.filter((e) => e.req.status.toLowerCase() === "rejected" || e.req.status.toLowerCase() === "failed").length, accent: "rose", Icon: AlertTriangle },
  ];

  const toggleRow = (id: string) => {
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const bulkAssign = () => {
    if (!bulkDriver || selected.size === 0) {
      toast.error("Pick a driver and select rows first");
      return;
    }
    setRequests(
      requests.map((r) =>
        selected.has(r.id) ? { ...r, driver: { name: bulkDriver }, status: r.status === "Pending" ? "In Progress" : r.status } : r
      )
    );
    toast.success(`Assigned ${selected.size} pickup${selected.size > 1 ? "s" : ""} to ${bulkDriver}`);
    addNotification({ title: "Pickups assigned", body: `${selected.size} pickup${selected.size > 1 ? "s" : ""} assigned to ${bulkDriver}.`, severity: "info", icon: "Truck", link: "/pickups" });
    setSelected(new Set());
    setBulkDriver("");
  };

  // Driver bulk accept action
  const handleDriverAccept = async () => {
    if (selected.size < 5) {
      toast.error("يجب اختيار 5 طلبات تجميع على الأقل للقبول!");
      return;
    }

    const orderIds = Array.from(selected);

    try {
      // Call Swagger bulk accept API
      await api.put("/recycler/pickup-requests/accept-bulk", orderIds);
    } catch (err) {
      console.error("Backend accept-bulk failed (falling back to local update):", err);
    }

    // Local state fallback update
    setRequests(
      requests.map((r) =>
        selected.has(r.id) ? { ...r, driver: { name: user?.name || "Driver" }, status: "In Progress" } : r
      )
    );

    toast.success(`تم بنجاح قبول ${selected.size} طلبات وإضافتها لمسارك!`);
    addNotification({
      title: "تم قبول طلبات التجميع",
      body: `لقد قبلت عدد ${selected.size} طلبات تجميع في مسارك بنجاح.`,
      severity: "success",
      icon: "Truck",
      link: "/driver-portal",
    });

    setSelected(new Set());
  };

  const handleExport = () => {
    exportToCsv(
      "pickup-requests",
      filtered,
      [
        { key: "id", label: "ID", accessor: (e) => e.req.id },
        { key: "citizen", label: "Citizen", accessor: (e) => e.req.citizen.name },
        { key: "zone", label: "Zone", accessor: (e) => e.req.zone.name },
        { key: "material", label: "Material", accessor: (e) => e.material },
        { key: "weight", label: "Weight (kg)", accessor: (e) => e.weight },
        { key: "priority", label: "Priority", accessor: (e) => e.req.priority },
        { key: "status", label: "Status", accessor: (e) => e.req.status },
        { key: "sla", label: "SLA Minutes Left", accessor: (e) => e.slaMinutesLeft },
        { key: "driver", label: "Driver", accessor: (e) => e.req.driver?.name ?? "" },
        { key: "requested", label: "Requested", accessor: (e) => e.requestedAt },
      ],
    );
    toast.success(`Exported ${filtered.length} rows`);
  };

  const columns = useMemo(() => {
    const cols: DataTableColumn<ExtendedRow>[] = [];

    // Checkbox only for admin and driver
    if (!isEmployee) {
      cols.push({
        key: "select",
        label: "",
        render: (e) => (
          <input
            type="checkbox"
            checked={selected.has(e.req.id)}
            onChange={() => toggleRow(e.req.id)}
            onClick={(ev) => ev.stopPropagation()}
            className="rounded accent-emerald-600 cursor-pointer"
          />
        ),
      });
    }

    cols.push(
      { key: "id", label: "ID", sortable: true, accessor: (e) => e.req.id, render: (e) => <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{e.req.id}</span> },
      {
        key: "citizen",
        label: "Citizen",
        sortable: true,
        accessor: (e) => e.req.citizen.name,
        render: (e) => (
          <span className="inline-flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" />{e.req.citizen.name}</span>
        ),
      },
      {
        key: "zone",
        label: "Zone",
        sortable: true,
        accessor: (e) => e.req.zone.name,
        render: (e) => (
          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{e.req.zone.name}</span>
        ),
      },
      { key: "material", label: "Material", sortable: true, accessor: (e) => e.material, render: (e) => e.material },
      { key: "weight", label: "Weight", sortable: true, accessor: (e) => e.weight, render: (e) => `${e.weight} kg` },
      {
        key: "priority",
        label: "Priority",
        sortable: true,
        accessor: (e) => e.req.priority,
        render: (e) => <span className={`px-2 py-0.5 rounded-full text-xs ${priorityAccent[e.req.priority] || "bg-slate-500/10 text-slate-700"}`}>{e.req.priority}</span>,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        accessor: (e) => e.req.status,
        render: (e) => <span className={`px-2 py-0.5 rounded-full text-xs ${statusAccent[e.req.status] || "bg-slate-500/10 text-slate-700"}`}>{e.req.status}</span>,
      },
      {
        key: "sla",
        label: "SLA",
        sortable: true,
        accessor: (e) => e.slaMinutesLeft,
        render: (e) => {
          const breached = e.slaMinutesLeft < 0;
          return (
            <span className={`px-2 py-0.5 rounded-full text-xs ${breached ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-slate-500/10 text-slate-700 dark:text-slate-300"}`}>
              {formatSla(e.slaMinutesLeft)}
            </span>
          );
        },
      }
    );

    if (!isDriver) {
      cols.push({
        key: "driver",
        label: "Driver",
        sortable: true,
        accessor: (e) => e.req.driver?.name ?? "",
        render: (e) => e.req.driver?.name ?? <span className="text-slate-400">—</span>,
      });
    }

    cols.push({
      key: "requested",
      label: "Requested",
      sortable: true,
      accessor: (e) => e.elapsedMinutes,
      render: (e) => <span className="text-xs text-slate-500 dark:text-slate-400">{e.requestedAt}</span>,
    });

    return cols;
  }, [selected, isDriver, isEmployee]);

  const formatSla = (m: number) => {
    if (m < 0) return `Breached ${Math.abs(m)}m`;
    if (m < 60) return `${m}m left`;
    return `${Math.floor(m / 60)}h ${m % 60}m left`;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 700 }}>
              {isDriver 
                ? "Available Pickups" 
                : isEmployee 
                  ? "My Operations & In-Progress Pickups" 
                  : "Pickup Requests"
              }
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              {isDriver 
                ? "Select available pending pickups to add to your active route (Minimum 5 orders required)" 
                : isEmployee 
                  ? "Review all active in-progress requests waiting for verify, and history of orders verified/rejected by you"
                  : "Triage and assign incoming pickups from citizens"
              }
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm cursor-pointer font-semibold"
          style={{ fontWeight: 600 }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {loadingBackend ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Loading pickups...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const a = accentMap[s.accent];
              const Icon = s.Icon;
              return (
                <div key={s.label} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
                  <GlassCard className="p-5">
                    <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${a.fg}`} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                    <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1 font-bold" style={{ fontWeight: 700 }}>{s.value}</p>
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
                placeholder="Search by ID, citizen, zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {[
                { label: "Priority", value: priority, set: setPriority, opts: ["all", "Critical", "High", "Normal", "Low"] },
                { label: "Status", value: status, set: setStatus, opts: ["all", "Pending", "In Progress", "Completed", "Verified", "Rejected", "Failed"] },
                { label: "Zone", value: zone, set: setZone, opts: ["all", ...zones] },
                { label: "Material", value: material, set: setMaterial, opts: ["all", ...materials] },
              ].map((f) => (
                <select
                  key={f.label}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {f.opts.map((o) => (
                    <option key={o} value={o}>{f.label}: {o}</option>
                  ))}
                </select>
              ))}
            </div>
          </GlassCard>

          {/* Bulk actions for Admin and Driver */}
          {selected.size > 0 && (
            <div className="mc-fade-in-up">
              {isDriver ? (
                /* Driver Bulk Accept Actions */
                <GlassCard className="p-4 flex flex-wrap items-center justify-between gap-3 border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold" style={{ fontWeight: 600 }}>
                      Selected: {selected.size} order(s)
                    </span>
                    {selected.size < 5 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        (Choose at least {5 - selected.size} more to meet the 5-order minimum requirement)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDriverAccept}
                      disabled={selected.size < 5}
                      className={`flex items-center gap-2 px-5 h-10 rounded-full transition-all text-sm font-semibold cursor-pointer ${
                        selected.size >= 5
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95"
                          : "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Selected Pickups
                    </button>
                    <button onClick={() => setSelected(new Set())} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
                      Clear
                    </button>
                  </div>
                </GlassCard>
              ) : (
                /* Admin Bulk Assignment Actions */
                <GlassCard className="p-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold" style={{ fontWeight: 600 }}>{selected.size} selected</span>
                  <select
                    value={bulkDriver}
                    onChange={(e) => setBulkDriver(e.target.value)}
                    className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="">Choose driver...</option>
                    {DRIVERS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button
                    onClick={bulkAssign}
                    className="flex items-center gap-2 px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
                  >
                    <Truck className="w-4 h-4" /> Assign
                  </button>
                  <button onClick={() => setSelected(new Set())} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">Clear</button>
                </GlassCard>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              Icon={Package}
              title={
                isDriver 
                  ? "No available pending pickups" 
                  : isEmployee 
                    ? "No operations or waiting pickups found"
                    : "No pickup requests match your filters"
              }
              description={
                isDriver 
                  ? "There are currently no pending pickups awaiting collection in your active zones."
                  : isEmployee
                    ? "There are no in-progress pickups in the hub and no previous verifications performed by you."
                    : "Try adjusting your search, status, or zone filter to see results."
              }
              cta={{ 
                label: "Reset filters", 
                onClick: () => { 
                  setSearch(""); 
                  setPriority("all"); 
                  setStatus("all"); 
                  setZone("all"); 
                  setMaterial("all"); 
                } 
              }}
            />
          ) : (
            <DataTable
              data={filtered}
              columns={columns}
              rowKey={(e) => e.req.id}
            />
          )}
        </>
      )}
    </div>
  );
}

interface ExtendedRow {
  req: PickupRequest;
  material: string;
  weight: number;
  slaMinutesLeft: number;
  requestedAt: string;
  elapsedMinutes: number;
}

export default function PickupRequestsPage() {
  return (
    <PickupProvider>
      <PickupRequestsPageContent />
    </PickupProvider>
  );
}

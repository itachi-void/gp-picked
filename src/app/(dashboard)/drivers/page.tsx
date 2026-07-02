"use client";

import { useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import {
  Users,
  Star,
  MapPin,
  Truck,
  Clock,
  Phone,
  Mail,
  Calendar,
  Award,
  Plus,
  Search,
  Download,
  Edit,
  Activity,
  Package,
  DollarSign,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { useNotifications } from "@/app/contexts/NotificationContext";
import api from "@/lib/axios";

export type DriverStatus = "active" | "available" | "inactive" | "on-leave";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  currentRoute: string;
  vehicleNumber: string;
  completedTrips: number;
  rating: number;
  earnings: number;
  onTimePercentage: number;
  fuelEfficiency: number;
  joinDate: string;
  avatar: string;
  lastActive: string;
}

const statusAccent: Record<DriverStatus, { bg: string; fg: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  available: { bg: "bg-sky-500/10", fg: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  inactive: { bg: "bg-slate-500/10", fg: "text-slate-600 dark:text-slate-300", dot: "bg-slate-500" },
  "on-leave": { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
};

const normalizeStatus = (status: string): DriverStatus => {
  const s = String(status || "").toLowerCase();
  if (s.includes("active") || s.includes("a5oya")) return "active";
  if (s.includes("available") || s.includes("compete") || s.includes("free")) return "available";
  if (s.includes("leave")) return "on-leave";
  return "inactive";
};

export default function DriversListPage() {
  const { role, user } = useRoleContext();
  const currentRole = role?.toLowerCase() ?? "citizen";
  const { addNotification } = useNotifications();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | DriverStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  const [driverToView, setDriverToView] = useState<Driver | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const emptyForm = { name: "", phone: "", email: "", status: "active" as DriverStatus, currentRoute: "-", vehicleNumber: "" };
  const [form, setForm] = useState(emptyForm);

  const canManage = !(currentRole === "citizen" || currentRole === "driver" || currentRole === "recycler");

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/recyclers-details");
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped: Driver[] = list.map((d: any) => {
        const name = d.fullName || "Driver User";
        const initials = name
          .split(" ")
          .map((n: any) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        
        return {
          id: String(d.recyclerID || d.id),
          name,
          phone: d.phone || "01000000000",
          email: d.email || `${name.toLowerCase().replace(/\s+/g, "")}@smartwaste.com`,
          status: normalizeStatus(d.status),
          currentRoute: d.currentRoute || "Cairo Route",
          vehicleNumber: d.vehicleInfo || "N/A",
          completedTrips: d.totalTripsCompleted || 0,
          rating: d.rating ? parseFloat(Number(d.rating).toFixed(1)) : 5.0,
          earnings: d.earnings || (d.totalTripsCompleted ? d.totalTripsCompleted * 150 : 250),
          onTimePercentage: d.onTimePercentage || 95,
          fuelEfficiency: d.fuelEfficiency || 12,
          joinDate: d.joinDate ? new Date(d.joinDate).toISOString().slice(0, 10) : "2026-01-15",
          avatar: initials || "DR",
          lastActive: d.lastActive || "2 hours ago",
        };
      });
      setDrivers(mapped);
    } catch (err) {
      console.error("Failed to fetch drivers from backend:", err);
      toast.error("Failed to load drivers from API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (d: Driver) => {
    setEditingId(d.id);
    setForm({ name: d.name, phone: d.phone, email: d.email, status: d.status, currentRoute: d.currentRoute, vehicleNumber: d.vehicleNumber });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (!form.phone.trim()) { toast.error("Phone required"); return; }
    if (!form.email.trim()) { toast.error("Email required"); return; }

    const phoneRegex = /^01[0125]\d{8}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("Phone number must match standard format (e.g., 01012345678)");
      return;
    }

    if (editingId) {
      try {
        // 1. Update recycler profile details: fullName, phone, vehicleInfo via PUT /api/Recycler/update/{id}
        await api.put(`/Recycler/update/${editingId}`, {
          fullName: form.name,
          phone: form.phone,
          vehicleInfo: form.vehicleNumber || "N/A"
        });

        // 2. Update status via PUT /api/admin/update-recycler-status
        await api.put(`/admin/update-recycler-status?recyclerId=${editingId}&newStatus=${form.status}`);

        addNotification({ title: "Driver updated", body: `${form.name} was updated.`, severity: "info", icon: "UserCheck", link: "/drivers" });
        toast.success(`Updated ${form.name}`);
        fetchDrivers();
        closeForm();
      } catch (err: any) {
        console.error("Failed to update driver:", err);
        toast.error(err.response?.data?.message || "Failed to update driver on server");
      }
    } else {
      try {
        const password = "SmartWaste@123"; // Valid password hash according to server requirements

        // Call POST /api/admin/create-recycler with query params
        await api.post(`/admin/create-recycler?FullName=${encodeURIComponent(form.name)}&Phone=${form.phone}&PasswordHash=${encodeURIComponent(password)}&Email=${encodeURIComponent(form.email)}`);

        addNotification({ title: "Driver added", body: `${form.name} joined the fleet.`, severity: "success", icon: "UserCheck", link: "/drivers" });
        toast.success(`Added ${form.name}`);
        fetchDrivers();
        closeForm();
      } catch (err: any) {
        console.error("Failed to add driver:", err);
        toast.error(err.response?.data?.message || "Failed to add driver on server");
      }
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm("Delete driver?")) return;
    const name = form.name;
    try {
      await api.delete(`/admin/delete-recycler?recyclerId=${editingId}`);
      addNotification({ title: "Driver removed", body: `${name} was removed.`, severity: "warning", icon: "UserCheck", link: "/drivers" });
      toast.success(`Deleted ${name}`);
      fetchDrivers();
      closeForm();
    } catch (err: any) {
      console.error("Failed to delete driver:", err);
      toast.error(err.response?.data?.message || "Failed to delete driver on server");
    }
  };

  const inputCls = "w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeDrivers = drivers.filter((d) => d.status === "active").length;
  const avgRating = drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : "5.0";
  const totalEarnings = drivers.reduce((sum, d) => sum + d.earnings, 0);
  const totalTrips = drivers.reduce((sum, d) => sum + d.completedTrips, 0);

  const stats = [
    { label: "Total Drivers", value: drivers.length, icon: Users, accent: "emerald", subtitle: `${activeDrivers} active now` },
    { label: "Average Rating", value: avgRating, icon: Star, accent: "amber", subtitle: "Out of 5.0" },
    { label: "Total Trips", value: totalTrips, icon: Package, accent: "violet", subtitle: "All time" },
    { label: "Total Earnings", value: `$${(totalEarnings / 1000).toFixed(1)}k`, icon: DollarSign, accent: "teal", subtitle: "This month" },
  ];

  if (loading && drivers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-emerald-600/80 font-medium text-lg">Loading fleet drivers registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Drivers</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage collection drivers and assignments</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              exportToCsv("drivers", filteredDrivers, [
                { key: "id", label: "ID" },
                { key: "name", label: "Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "status", label: "Status" },
                { key: "currentRoute", label: "Route" },
                { key: "completedTrips", label: "Trips" },
                { key: "rating", label: "Rating" },
                { key: "earnings", label: "Earnings" },
                { key: "vehicleNumber", label: "Vehicle" },
              ]);
              toast.success(`Exported ${filteredDrivers.length} rows`);
            }}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          {canManage && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Driver
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const accent = accentMap[stat.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" };
          return (
            <div
              key={stat.label}
              className="mc-card-in hover-lift"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${accent.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${accent.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{stat.subtitle}</p>
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
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="available">Available</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </GlassCard>

      {filteredDrivers.length === 0 ? (
        <EmptyState
          Icon={Users}
          title="No drivers found"
          description="Adjust your search or status filter, or add a new driver to get started."
          cta={canManage ? { label: "Add driver", onClick: openAdd } : undefined}
        />
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedDrivers.map((driver, index) => {
          const sa = statusAccent[driver.status] || statusAccent.active;
          return (
            <div
              key={driver.id}
              className="mc-card-in hover-lift"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <GlassCard className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-700 dark:text-emerald-300 relative text-lg font-bold" style={{ fontWeight: 600 }}>
                      {driver.avatar}
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0a0e14] ${sa.dot}`} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>{driver.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">ID: {driver.id}</p>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => openEdit(driver)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${sa.bg} ${sa.fg} font-semibold`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${sa.dot}`} />
                    <span className="capitalize">{driver.status.replace("-", " ")}</span>
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{driver.phone}</div>
                  <div className="flex items-center gap-2 truncate"><Mail className="w-4 h-4 text-slate-400" />{driver.email}</div>
                  <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" />{driver.vehicleNumber}</div>
                  {driver.currentRoute !== "-" && (
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{driver.currentRoute}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Trips</p>
                    <p className="text-lg text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>{driver.completedTrips}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Earnings</p>
                    <p className="text-lg text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>${(driver.earnings / 1000).toFixed(1)}k</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-slate-200 dark:border-white/10">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">On-Time</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold" style={{ fontWeight: 600 }}>{driver.onTimePercentage}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <p className="text-sm text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>{driver.rating}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fuel</p>
                    <p className="text-sm text-sky-600 dark:text-sky-400 font-bold" style={{ fontWeight: 600 }}>{driver.fuelEfficiency} km/L</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{driver.lastActive}</div>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{driver.joinDate}</div>
                </div>

                <button
                  onClick={() => setDriverToView(driver)}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
                >
                  View Details
                </button>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 text-sm font-semibold bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 text-sm font-semibold bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
        </>
      )}

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-base tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Top Performers</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">This month's best drivers</p>

        <div className="space-y-2">
          {drivers
            .slice()
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
            .map((driver, index) => (
              <div
                key={driver.id}
                className="mc-slide-from-left flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-2xl"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold" style={{ fontWeight: 600 }}>
                    #{index + 1}
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center font-bold" style={{ fontWeight: 600 }}>
                    {driver.avatar}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>{driver.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{driver.completedTrips} trips completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>{driver.rating}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>${driver.earnings.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">earnings</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </GlassCard>

      {driverToView && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDriverToView(null)}
        >
          <div
            className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center text-xl font-bold" style={{ fontWeight: 600 }}>
                {driverToView.avatar}
              </div>
              <div>
                <h3 className="text-xl tracking-tight text-slate-900 dark:text-white font-bold">{driverToView.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">ID: {driverToView.id}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Status", driverToView.status],
                ["Phone", driverToView.phone],
                ["Email", driverToView.email],
                ["Vehicle", driverToView.vehicleNumber],
                ["Route", driverToView.currentRoute],
                ["Rating", `${driverToView.rating} ★`],
                ["Trips", String(driverToView.completedTrips)],
                ["On-Time", `${driverToView.onTimePercentage}%`],
                ["Earnings", `$${driverToView.earnings.toLocaleString()}`],
                ["Joined", driverToView.joinDate],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <span className="text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-slate-900 dark:text-white capitalize font-bold" style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDriverToView(null)}
              className="mt-6 w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeForm}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>{editingId ? "Edit Driver" : "Add Driver"}</h2>
              <button onClick={closeForm} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Phone</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="e.g. 01012345678" />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Email</span>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="e.g. driver@smartwaste.com" />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Status</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })} className={inputCls}>
                  <option value="active">Active</option>
                  <option value="available">Available</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Current Route</span>
                <input value={form.currentRoute} onChange={(e) => setForm({ ...form, currentRoute: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Vehicle Number</span>
                <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} className={inputCls} />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between gap-2">
              <div>
                {editingId && (
                  <button onClick={handleDelete} className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm cursor-pointer font-bold" style={{ fontWeight: 600 }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={closeForm} className="h-10 px-5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
                <button onClick={handleSubmit} className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer font-bold" style={{ fontWeight: 600 }}>{editingId ? "Save" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentRole === "driver" && (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Viewing as driver — limited actions
        </p>
      )}
    </div>
  );
}

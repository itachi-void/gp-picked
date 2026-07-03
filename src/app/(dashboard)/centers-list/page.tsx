"use client";

import { useState, useEffect, useMemo } from "react";
import "@/app/components/motion/motion-components.css";
import { useQuery, useQueries, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Building2, MapPin, Users, Trash2, Edit, Plus, X, Activity, Eye } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import CenterForm from "./CenterForm";



export interface Center {
  id: string;
  name: string;
  location: string;
  capacity: number | string;
  currentLoad: number | string;
  status: "active" | "inactive" | "maintenance";
  manager: string;
  contact: string;
  password?: string;
}

const statusAccent: Record<string, { bg: string; fg: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { bg: "bg-slate-500/10", fg: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  maintenance: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
};

export default function CentersListPage() {
  const { role } = useRoleContext();
  const { addNotification } = useNotifications();

  const [centers, setCenters] = useState<Center[]>([]);  // ١. البيانات

  const { data: rawStaff = [], isLoading: staffLoading, refetch: refetchStaff } = useQuery<any[]>({
    queryKey: ["hub-staff-all"],
    queryFn: async () => {
      const res = await api.get("/HubStaff/allHubStaff");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete("/admin/delete-hub-staff", {
        params: { hubStaffId: id },
      });
    },
    onSuccess: () => {
      toast.success("Hub staff member deleted successfully");
      refetchStaff();
    },
    onError: (err: any) => {
      console.error("Failed to delete hub staff:", err);
      toast.error(err.response?.data?.message || "Failed to delete hub staff");
    },
  });

  const addMutation = useMutation({
    mutationFn: async (formData: { fullName: string; passwordHash: string }) => {
      await api.post("/admin/create-hub-staff", formData);
    },
    onSuccess: () => {
      toast.success("Hub staff center created successfully");
      refetchStaff();
      closeModal();
    },
    onError: (err: any) => {
      console.error("Failed to create hub staff:", err);
      toast.error(err.response?.data?.message || "Failed to create hub staff");
    },
  });

  const staffDetailsQueries = useQueries({
    queries: rawStaff.map((s: any, idx: number) => {
      const staffId = s.hubStaffId || s.id || idx;
      return {
        queryKey: ["hub-staff-detail", String(staffId)],
        queryFn: async () => {
          const res = await api.get(`/HubStaff/${staffId}`);
          return res.data || {};
        },
      };
    }),
  });

  const loading = staffLoading || staffDetailsQueries.some((q) => q.isLoading);

  const staffQueryDataString = JSON.stringify(
    staffDetailsQueries.map((q) => ({
      status: q.status,
      fullName: q.data?.fullName,
      phone: q.data?.phone,
      historyLength: Array.isArray(q.data?.history) ? q.data.history.length : 0,
      firstHistoryAddress: Array.isArray(q.data?.history) ? q.data.history.find((r: any) => r.address)?.address : undefined,
    }))
  );

  const fetchedCenters = useMemo(() => {
    if (rawStaff.length === 0) return [];

    const queryData = JSON.parse(staffQueryDataString);

    return rawStaff.map((s: any, idx: number) => {
      const staffId = s.hubStaffId || s.id || idx;
      let managerName = s.name || "Hub Staff";
      let location = "not yet from api";
      let status = "active";
      let contact = "not yet from api";

      const qResult = queryData[idx];
      if (qResult && qResult.status === "success") {
        if (qResult.fullName) {
          managerName = qResult.fullName;
        }
        if (qResult.firstHistoryAddress) {
          location = qResult.firstHistoryAddress;
        }
        if (qResult.phone) {
          contact = qResult.phone;
        }
      }

      return {
        id: String(staffId),
        name: `${managerName}'s Collection Center`,
        location,
        capacity: "not yet from api",
        currentLoad: "not yet from api",
        status: status as any,
        manager: managerName,
        contact,
      };
    });
  }, [rawStaff, staffQueryDataString]);

  useEffect(() => {
    if (fetchedCenters && fetchedCenters.length > 0) {
      setCenters(fetchedCenters);
    }
  }, [fetchedCenters]);

  const [isOpen, setIsOpen] = useState(false);                // ٢. الـ Modal مفتوح؟
  const [editing, setEditing] = useState<Center | null>(null);// ٣. بنعدل على أنهي مركز؟
  const [create, setCreate] = useState(false);                // ٤. بنضيف جديد؟
  const [form, setForm] = useState<Center>({ id: "", name: "", location: "", capacity: "not yet from api", currentLoad: "not yet from api", status: "active", manager: "", contact: "" });

  // ========== إحصائيات ==========
  const stats = [
    { label: "Total Centers", value: centers.length, icon: Building2, accent: "emerald" },
    { label: "Active Centers", value: centers.filter((c) => c.status === "active").length, icon: Users, accent: "sky" },
    { label: "Total Capacity", value: "not yet from api", icon: Activity, accent: "rose" },
  ];

  // ========== فتح الـ Modal للإضافة ==========
  const openCreate = () => {
    setForm({ id: "",  name: "", location: "", capacity: "not yet from api", currentLoad: "not yet from api", status: "active", manager: "", contact: "" });
    setCreate(true);        // بنضيف جديد
    setEditing(null);       // مفيش تعديل
    setIsOpen(true);        // افتح
  };

  // ========== فتح الـ Modal للتعديل ==========
  const openEdit = (center: Center) => {
    setForm(center);        // املأ الفورم ببيانات المركز
    setEditing(center);     // بنعدل على المركز ده
    setCreate(false);       // مش إضافة
    setIsOpen(true);        // افتح
  };

  // ========== قفل الـ Modal ==========
  const closeModal = () => {
    setIsOpen(false);       // قفل
    setEditing(null);       // امسح
    setCreate(false);       // امسح
  };

  // ========== حفظ ==========
  const handleSave = () => {
    if (editing) {
      setCenters(
        centers.map(c =>
          c.id === editing.id ? form : c
        )
      );
      toast.success("Center details updated locally");
      closeModal();
    } else if (create) {
      if (!form.manager.trim()) {
        toast.error("Manager name is required (Hub Staff FullName)");
        return;
      }
      if (form.manager.length < 5 || form.manager.length > 30) {
        toast.error("Manager name must be between 5 and 30 characters");
        return;
      }
      if (!form.password || form.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      addMutation.mutate({
        fullName: form.manager,
        passwordHash: form.password,
      });
    }
  };

  // ========== حذف ==========
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this collection center staff member?")) {
      deleteMutation.mutate(Number(id));
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold">Collection Centers</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage recycling collection centers</p>
          </div>
        </div>
        {(role === "Admin") && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm">
            <Plus className="w-4 h-4" /> Add Center
          </button>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Future Centers Suggestion</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            These zones are suggested based on current pickup activity. Each zone shows active citizens and request volume. Real community management features are coming soon.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const a = accentMap[s.accent] || accentMap.slate;
          return (
            <div key={s.label} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1 font-semibold">{s.value}</p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-left">
                {["Center", "Location", "Capacity", "Load", "Status", "Manager", "Actions"].map((h) => (
                  <th key={h} className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map((c) => {
                const sa = statusAccent[c.status];
                const pct = typeof c.currentLoad === "number" && typeof c.capacity === "number"
                  ? Math.min(100, Math.round((c.currentLoad / c.capacity) * 100))
                  : 0;
                return (
                  <tr key={c.id} className="border-b last:border-0 border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-900 dark:text-white font-semibold">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{c.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200">{c.capacity}</td>
                   <td className="py-4 px-6">  {/* خلية في الجدول */}
  <div className="space-y-1 min-w-[140px]">  {/* حاوية بعرض أدنى 140px */}
                        {/* ١. الرقم (الحمل الحالي) */}
                        <div className="text-sm text-slate-900 dark:text-white font-semibold">
      {c.currentLoad}  {/* 3200 → "3,200" */}
                        </div>
                        {/* ٢. شريط التقدم */}
                        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
      {/* الخلفية: شريط كامل رمادي */}
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" 
                            style={{ width: `${pct}%` }}
                          />
                                  {/* style={{ width: `${pct}%` }}  عرض الشريط = النسبة */}
      {/* الشريط الأخضر المتدرج */}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1.5 ${sa.bg} ${sa.fg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${sa.dot}`} />
                        <span className="capitalize">{c.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-900 dark:text-white font-semibold">{c.manager}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{c.contact}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {(role === "Admin") && (
                          <>
                            <button onClick={() => openEdit(c)} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer">
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
      </GlassCard>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white font-semibold">
                {editing ? "Edit Center" : "Add Center"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <CenterForm form={form} setForm={setForm} />
            {create && (
              <label className="block mt-3">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1 font-semibold" style={{ fontWeight: 600 }}>Password</span>
                <input
                  type="password"
                  value={form.password || ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                  className="w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer">
                {editing ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
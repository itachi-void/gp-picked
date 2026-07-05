"use client";

import { useState, useEffect, useMemo } from "react";
import "@/app/components/motion/motion-components.css";
import { useQuery, useQueries, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Building2, MapPin, Users, Trash2, Edit, Plus, X, Activity, Eye } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t, tApi, language } = useLanguage();

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
      toast.success(language === "ar" ? "تم حذف عضو موظفي المركز بنجاح" : "Hub staff member deleted successfully");
      refetchStaff();
    },
    onError: (err: any) => {
      console.error("Failed to delete hub staff:", err);
      toast.error(err.response?.data?.message || (language === "ar" ? "فشل في حذف موظفي المركز" : "Failed to delete hub staff"));
    },
  });

  const addMutation = useMutation({
    mutationFn: async (formData: { fullName: string; passwordHash: string }) => {
      await api.post("/admin/create-hub-staff", formData);
    },
    onSuccess: () => {
      toast.success(language === "ar" ? "تم إنشاء مركز موظفي المركز بنجاح" : "Hub staff center created successfully");
      refetchStaff();
      closeModal();
    },
    onError: (err: any) => {
      console.error("Failed to create hub staff:", err);
      toast.error(err.response?.data?.message || (language === "ar" ? "فشل في إنشاء موظفي المركز" : "Failed to create hub staff"));
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
      let location = "-";
      let status = "active";
      let contact = "-";

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
        name: language === "ar" ? `${managerName} ${t("centersList.centerNameSuffix")}` : `${managerName}${t("centersList.centerNameSuffix")}`,
        location,
        capacity: "-",
        currentLoad: "-",
        status: status as any,
        manager: managerName,
        contact,
      };
    });
  }, [rawStaff, staffQueryDataString, language, t]);

  useEffect(() => {
    if (fetchedCenters && fetchedCenters.length > 0) {
      setCenters(fetchedCenters);
    }
  }, [fetchedCenters]);

  const [isOpen, setIsOpen] = useState(false);                // ٢. الـ Modal مفتوح؟
  const [editing, setEditing] = useState<Center | null>(null);// ٣. بنعدل على أنهي مركز؟
  const [create, setCreate] = useState(false);                // ٤. بنضيف جديد؟
  const [form, setForm] = useState<Center>({ id: "", name: "", location: "", capacity: "-", currentLoad: "-", status: "active", manager: "", contact: "" });

  // ========== إحصائيات ==========
  const stats = [
    { label: t("centersList.totalCenters"), value: centers.length, icon: Building2, accent: "emerald" },
    { label: t("centersList.activeCenters"), value: centers.filter((c) => c.status === "active").length, icon: Users, accent: "sky" },
    { label: t("centersList.totalCapacity"), value: "-", icon: Activity, accent: "rose" },
  ];

  // ========== فتح الـ Modal للإضافة ==========
  const openCreate = () => {
    setForm({ id: "",  name: "", location: "", capacity: "-", currentLoad: "-", status: "active", manager: "", contact: "" });
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
      toast.success(language === "ar" ? "تم تحديث تفاصيل المركز محلياً" : "Center details updated locally");
      closeModal();
    } else if (create) {
      if (!form.manager.trim()) {
        toast.error(t("centersList.managerNameReq"));
        return;
      }
      if (form.manager.length < 5 || form.manager.length > 30) {
        toast.error(t("centersList.managerNameLen"));
        return;
      }
      if (!form.password || form.password.length < 8) {
        toast.error(t("centersList.passwordMin"));
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
    if (confirm(t("centersList.deleteConfirm"))) {
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
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold">{t("centersList.title")}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">{t("centersList.subtitle")}</p>
          </div>
        </div>
        {(role === "Admin") && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer">
            <Plus className="w-4 h-4" /> {t("centersList.addCenter")}
          </button>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t("centersList.futureSuggestion")}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            {t("centersList.futureSuggestionDesc")}
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
              <tr className="border-b border-slate-200 dark:border-white/10 text-start">
                {[
                  t("centersList.table.center"),
                  t("centersList.table.location"),
                  t("centersList.table.capacity"),
                  t("centersList.table.load"),
                  t("centersList.table.status"),
                  t("centersList.table.manager"),
                  t("centersList.table.actions")
                ].map((h) => (
                  <th key={h} className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 font-semibold text-start">{h}</th>
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
                        <span className="capitalize">{tApi(c.status)}</span>
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
                {editing ? t("centersList.editCenterModal") : t("centersList.addCenterModal")}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <CenterForm form={form} setForm={setForm} />
            {create && (
              <label className="block mt-3">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1 font-semibold" style={{ fontWeight: 600 }}>{t("centersList.passwordLabel")}</span>
                <input
                  type="password"
                  value={form.password || ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t("centersList.passwordPlaceholder")}
                  className="w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                {t("common.cancel")}
              </button>
              <button onClick={handleSave} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer">
                {editing ? t("centersList.saveChanges") : t("centersList.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Shield, Truck, UserCircle2, Users, Mail, Calendar, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios";
import { useRoleContext } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type Role = "admin" | "driver" | "citizen" | "employee";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
  joinedAt: string;
  lastSeen: string;
  walletPoints: number;
}

const roleConfig: Record<Role, { label: string; icon: typeof Shield; bg: string; fg: string }> = {
  admin:    { label: "Admin",    icon: Shield,      bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  driver:   { label: "Driver",   icon: Truck,       bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400" },
  employee: { label: "Employee", icon: UserCircle2, bg: "bg-fuchsia-500/10", fg: "text-fuchsia-600 dark:text-fuchsia-400" },
  citizen:  { label: "Citizen",  icon: Users,       bg: "bg-violet-500/10",  fg: "text-violet-600 dark:text-violet-400" },
};

const accentMap: Record<string, { bg: string; fg: string }> = {
  emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  amber:   { bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400"     },
  sky:     { bg: "bg-sky-500/10",     fg: "text-sky-600 dark:text-sky-400"         },
};

function mapApiUser(item: any): User {
  const id = String(item.userId || item.id || "");
  const name = item.fullName || item.name || "Citizen";
  const roleRaw: string = (item.role || "citizen").toLowerCase();
  const role: Role = ["admin", "driver", "employee", "citizen"].includes(roleRaw)
    ? (roleRaw as Role) : "citizen";

  return {
    id,
    name,
    email: item.email || "no-email@smartwaste.com",
    role,
    status: item.status === "inactive" ? "inactive" : "active",
    joinedAt: item.joinedAt || "",
    lastSeen: item.lastSeen || "",
    walletPoints: item.walletPoints || item.points || 0,
  };
}

export default function UsersPage() {
  const { role } = useRoleContext();
  const router = useRouter();
  const { t, tApi, language } = useLanguage();

  useEffect(() => {
    if (role && !["Admin", "Manager"].includes(role)) {
      router.replace("/overview");
    }
  }, [role, router]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  if (role && !["Admin", "Manager"].includes(role)) return null;

  const [showForm, setShowForm] = useState(false);
  const emptyForm = { fullName: "", email: "", password: "", address: "", phone: "" };
  const [form, setForm] = useState(emptyForm);

  const ROLES: { value: Role | "all"; label: string }[] = useMemo(() => [
    { value: "all" as const,      label: "All"      },
    { value: "admin" as const,    label: t("auth.roleAdmin", "Admin")    },
    { value: "driver" as const,   label: t("auth.roleDriver", "Driver")   },
    { value: "employee" as const, label: "Employee" },
    { value: "citizen" as const,  label: t("auth.roleCitizen", "Citizen")  },
  ], [t]);

  const { data: rawData = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["sorting-users", { sortOrder: "Descending" }],
    queryFn: async () => {
      const res = await api.get("/User/SortingUser", {
        params: { sortOrder: "Descending" },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.delete("/admin/delete-user", {
        params: { userId },
      });
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetch();
    },
    onError: (err: any) => {
      console.error("Failed to delete user:", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    },
  });

  const addMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const multipartData = new FormData();
      multipartData.append("FullName", formData.fullName);
      multipartData.append("Email", formData.email);
      multipartData.append("Password", formData.password);
      multipartData.append("Address", formData.address);
      multipartData.append("Phone", formData.phone);
      
      await api.post("/admin/create-user", multipartData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("User created successfully");
      refetch();
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (err: any) => {
      console.error("Failed to create user:", err);
      toast.error(err.response?.data?.message || "Failed to create user");
    },
  });

  const handleDeleteUser = (id: number) => {
    if (confirm(t("users.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (form.fullName.length < 5) {
      toast.error(language === "ar" ? "يجب أن يكون الاسم الكامل من ٥ أحرف على الأقل" : "Full name must be at least 5 letters");
      return;
    }
    if (!form.email.includes("@")) {
      toast.error(language === "ar" ? "الرجاء إدخال بريد إلكتروني صالح" : "Please enter a valid email");
      return;
    }
    if (form.password.length < 8) {
      toast.error(language === "ar" ? "يجب أن تتكون كلمة المرور من ٨ رموز على الأقل" : "Password must be at least 8 characters");
      return;
    }
    if (form.address.length < 30) {
      toast.error(language === "ar" ? "يجب أن يكون العنوان من ٣٠ حرفاً على الأقل" : "Address must be at least 30 characters");
      return;
    }
    if (!/^01[0125][0-9]{8}$/.test(form.phone)) {
      toast.error(language === "ar" ? "يجب أن يكون رقم الهاتف رقم هاتف مصري صالح" : "Phone must be a valid Egyptian mobile number (e.g. 01012345678)");
      return;
    }

    addMutation.mutate(form);
  };

  const users = useMemo(() => rawData.map(mapApiUser), [rawData]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const summary = [
    { label: language === "ar" ? "إجمالي المستخدمين" : "Total Users", value: formatNumber(users.length), accent: "emerald" },
    { label: t("auth.roleAdmin"), value: formatNumber(users.filter((u) => u.role === "admin").length), accent: "emerald" },
    { label: t("auth.roleDriver"), value: formatNumber(users.filter((u) => u.role === "driver").length), accent: "amber" },
    { label: language === "ar" ? "النشطين" : "Active", value: formatNumber(users.filter((u) => u.status === "active").length), accent: "sky" },
  ];


  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} className="p-5">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded-full mt-2" />
            </GlassCard>
          ))}
        </div>
        <GlassCard className="p-0 h-64 bg-slate-200/50 dark:bg-slate-800/50"><div /></GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      <div data-aos="fade-up" className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-slate-900 dark:text-white tracking-tight" style={{ fontWeight: 700 }}>
            {t("users.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("users.subtitle")}
          </p>
        </div>
        {role === "Admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer font-bold"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            {t("users.addUser")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s, i) => {
          const a = accentMap[s.accent] || accentMap.emerald;
          return (
            <div key={s.label} data-aos="fade-up" data-aos-delay={i * 80}>
              <GlassCard className="p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className={`text-3xl tracking-tight mt-1 ${a.fg}`} style={{ fontWeight: 700 }}>
                  {s.value}
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <div data-aos="fade-up" className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t("users.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex gap-1 p-1 bg-slate-100/70 dark:bg-white/[0.04] rounded-full border border-slate-200/60 dark:border-white/5">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                roleFilter === r.value
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white"
              }`}
              style={{ fontWeight: 600 }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="overflow-hidden" data-aos="fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="text-start px-6 py-4" style={{ fontWeight: 600 }}>{language === "ar" ? "المستخدم" : "User"}</th>
                <th className="text-start px-6 py-4" style={{ fontWeight: 600 }}>{t("common.role")}</th>
                <th className="text-start px-6 py-4 hidden md:table-cell" style={{ fontWeight: 600 }}>{language === "ar" ? "تاريخ الانضمام" : "Joined"}</th>
                <th className="text-start px-6 py-4 hidden lg:table-cell" style={{ fontWeight: 600 }}>{language === "ar" ? "آخر ظهور" : "Last Seen"}</th>
                <th className="text-start px-6 py-4" style={{ fontWeight: 600 }}>{t("common.status")}</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    {t("users.noUsers")}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const rc = roleConfig[u.role] || roleConfig.citizen;
                  const RoleIcon = rc.icon;
                  const initials = u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  const displayJoined = u.joinedAt ? new Date(u.joinedAt).toLocaleDateString(language === "ar" ? "ar-EG" : []) : (language === "ar" ? "الآن" : "Just now");
                  const displayLastSeen = u.lastSeen ? new Date(u.lastSeen).toLocaleTimeString(language === "ar" ? "ar-EG" : [], { hour: "2-digit", minute: "2-digit" }) : (language === "ar" ? "نشط" : "Active");
                  return (
                    <tr key={u.id || u.name} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs shrink-0" style={{ fontWeight: 700 }}>
                            {initials || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-900 dark:text-white truncate font-bold" style={{ fontWeight: 600 }}>{u.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${rc.bg} ${rc.fg}`} style={{ fontWeight: 600 }}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {rc.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {displayJoined}
                        </span>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-slate-500 dark:text-slate-400">{displayLastSeen}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                        }`} style={{ fontWeight: 600 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {language === "ar" ? (u.status === "active" ? "نشط" : "غير نشط") : (u.status === "active" ? "Active" : "Inactive")}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-start flex items-center justify-end gap-1">
                        {role === "Admin" && (
                          <button
                            onClick={() => handleDeleteUser(Number(u.id))}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400 dark:text-slate-500">
          {language === "ar" ? (
            <>
              عرض {formatNumber(filtered.length)} من {formatNumber(users.length)} مستخدمين
            </>
          ) : (
            <>
              Showing {filtered.length} of {users.length} users
            </>
          )}
        </div>
      </GlassCard>

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10 mc-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>
                {t("users.addUser")}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t("users.fullName")}</span>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" placeholder={language === "ar" ? "الحد الأدنى ٥ أحرف" : "Min 5 letters"} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t("users.email")}</span>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" placeholder="user@domain.com" />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t("users.password")}</span>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" placeholder={t("centersList.passwordPlaceholder")} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t("users.address")}</span>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" placeholder={language === "ar" ? "العنوان بالتفصيل - ٣٠ حرفاً على الأقل" : "Min 30 characters"} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">{t("users.phone")}</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50" placeholder={language === "ar" ? "رقم محمول مصري مثل: 01012345678" : "Egyptian mobile e.g. 01012345678"} />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="h-10 px-5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button onClick={handleSubmit} className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer font-bold" style={{ fontWeight: 600 }}>
                {t("users.createUser")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


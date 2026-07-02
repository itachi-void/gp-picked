"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Shield, Truck, UserCircle2, Users, Mail, Calendar, MoreHorizontal } from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios";
import { useRoleContext } from "@/contexts/RoleContext";
import { useRouter } from "next/navigation";

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

const ROLES: { value: Role | "all"; label: string }[] = [
  { value: "all",      label: "All"      },
  { value: "admin",    label: "Admin"    },
  { value: "driver",   label: "Driver"   },
  { value: "employee", label: "Employee" },
  { value: "citizen",  label: "Citizen"  },
];

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
    joinedAt: item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : "Just now",
    lastSeen: item.lastSeen ? new Date(item.lastSeen).toLocaleTimeString() : "Active",
    walletPoints: item.walletPoints || item.points || 0,
  };
}

export default function UsersPage() {
  const { role } = useRoleContext();
  const router = useRouter();
  useEffect(() => {
    if (role && !["Admin", "Manager"].includes(role)) {
      router.replace("/overview");
    }
  }, [role, router]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  if (role && !["Admin", "Manager"].includes(role)) return null;

  const { data: rawData = [], isLoading } = useQuery<any[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await api.get("/User/SortingUser", {
        params: { sortOrder: "Descending" },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 30000,
  });

  const users = useMemo(() => rawData.map(mapApiUser), [rawData]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const summary = [
    { label: "Total Users", value: users.length, accent: "emerald" },
    { label: "Admins", value: users.filter((u) => u.role === "admin").length, accent: "emerald" },
    { label: "Drivers", value: users.filter((u) => u.role === "driver").length, accent: "amber" },
    { label: "Active", value: users.filter((u) => u.status === "active").length, accent: "sky" },
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
      <div data-aos="fade-up">
        <h1 className="text-2xl text-slate-900 dark:text-white tracking-tight" style={{ fontWeight: 700 }}>
          Users
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage all platform users
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s, i) => {
          const a = accentMap[s.accent];
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
            placeholder="Search name or email…"
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
                <th className="text-left px-6 py-4" style={{ fontWeight: 600 }}>User</th>
                <th className="text-left px-6 py-4" style={{ fontWeight: 600 }}>Role</th>
                <th className="text-left px-6 py-4 hidden md:table-cell" style={{ fontWeight: 600 }}>Joined</th>
                <th className="text-left px-6 py-4 hidden lg:table-cell" style={{ fontWeight: 600 }}>Last Seen</th>
                <th className="text-left px-6 py-4" style={{ fontWeight: 600 }}>Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const rc = roleConfig[u.role];
                  const RoleIcon = rc.icon;
                  const initials = u.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <tr key={u.id || u.name} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs shrink-0" style={{ fontWeight: 700 }}>
                            {initials || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-900 dark:text-white truncate" style={{ fontWeight: 600 }}>{u.name}</p>
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
                          {u.joinedAt}
                        </span>
                      </td>

                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-slate-500 dark:text-slate-400">{u.lastSeen}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                        }`} style={{ fontWeight: 600 }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {u.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
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
          Showing {filtered.length} of {users.length} users
        </div>
      </GlassCard>
    </div>
  );
}

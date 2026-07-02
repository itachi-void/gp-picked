"use client";

import { useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import { ShieldCheck, Users, Layers, ClipboardCheck, Edit3, UserCircle2, X, Loader2 } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useNotifications } from "@/app/contexts/NotificationContext";
import api from "@/lib/axios";

type TabId = "roles" | "users" | "scopes" | "reviews";
type Level = "None" | "Read" | "Write" | "Admin";

const TABS: { id: TabId; label: string; Icon: any }[] = [
  { id: "roles", label: "Roles", Icon: ShieldCheck },
  { id: "users", label: "Users", Icon: Users },
  { id: "scopes", label: "Scopes", Icon: Layers },
  { id: "reviews", label: "Access Reviews", Icon: ClipboardCheck },
];

interface Role { name: string; desc: string; users: number; perms: number; accent: string }
const initialRoles: Role[] = [
  { name: "Admin", desc: "Full system access", users: 1, perms: 28, accent: "violet" },
  { name: "Manager", desc: "Zone-scoped operations", users: 1, perms: 18, accent: "emerald" },
  { name: "Driver", desc: "Mobile field access", users: 2, perms: 6, accent: "sky" },
  { name: "Citizen", desc: "Self-service portal", users: 5, perms: 3, accent: "amber" },
];

const RESOURCES = ["Pickups", "Drivers", "Zones", "Reports", "Settings", "Audit"];
const LEVELS: Level[] = ["None", "Read", "Write", "Admin"];

type Matrix = Record<string, Record<string, Level>>;
const initialMatrix: Matrix = {
  Pickups:  { Admin: "Admin", Manager: "Write", Driver: "Read",  Citizen: "Write" },
  Drivers:  { Admin: "Admin", Manager: "Write", Driver: "Read",  Citizen: "None"  },
  Zones:    { Admin: "Admin", Manager: "Write", Driver: "Read",  Citizen: "Read"  },
  Reports:  { Admin: "Admin", Manager: "Read",  Driver: "None",  Citizen: "None"  },
  Settings: { Admin: "Admin", Manager: "None",  Driver: "None",  Citizen: "None"  },
  Audit:    { Admin: "Read",  Manager: "None",  Driver: "None",  Citizen: "None"  },
};

const pillAccent: Record<Level, string> = {
  Admin: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Write: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Read: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  None: "bg-slate-500/10 text-slate-500 dark:text-slate-400",
};

interface UserRow { name: string; email: string; role: string; zones: string; lastLogin: string; status: string; userId?: number }

const ALL_ZONES = ["Downtown", "Riverside", "Harbor", "Old City", "North", "East", "South", "Central"];

interface Scope { label: string; description: string; inheritedFrom: string; allowedRoles: string[]; count: number }
const initialScopes: Scope[] = [
  { label: "Zone scope: Downtown", description: "Operational scope for Downtown district", inheritedFrom: "Manager role", allowedRoles: ["Admin", "Manager"], count: 4 },
  { label: "Zone scope: Riverside", description: "Operational scope for Riverside district", inheritedFrom: "Manager role", allowedRoles: ["Admin", "Manager"], count: 3 },
  { label: "Zone scope: Harbor", description: "Field scope for Harbor district", inheritedFrom: "Driver role", allowedRoles: ["Admin", "Driver"], count: 8 },
  { label: "Tenant scope: EcoVoid HQ", description: "Global tenant scope", inheritedFrom: "Admin role", allowedRoles: ["Admin"], count: 16 },
];

interface Review { quarter: string; reviewer: string; completed: number; status: string }
const initialReviews: Review[] = [
  { quarter: "Q1 2026", reviewer: "Compliance Team", completed: 100, status: "Complete" },
  { quarter: "Q2 2026", reviewer: "Compliance Team", completed: 67, status: "In progress" },
  { quarter: "Q3 2026", reviewer: "Compliance Team", completed: 0, status: "Scheduled" },
  { quarter: "Q4 2026", reviewer: "Compliance Team", completed: 0, status: "Scheduled" },
];

const inputCls = "w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

export default function PermissionsPage() {
  const { role: currentRole } = useRoleContext();
  const { addNotification } = useNotifications();
  const [tab, setTab] = useState<TabId>("roles");
  const isAdmin = currentRole?.toLowerCase() === "admin" || currentRole?.toLowerCase() === "manager";

  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [matrix, setMatrix] = useLocalStorage<Matrix>("ecovoid.permissions.v1", initialMatrix);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [scopes, setScopes] = useLocalStorage<Scope[]>("ecovoid.permissions.scopes.v1", initialScopes);
  const [reviews, setReviews] = useLocalStorage<Review[]>("ecovoid.permissions.reviews.v1", initialReviews);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<{ name: string; desc: string; levels: Record<string, Level> }>({ name: "", desc: "", levels: {} });

  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [userForm, setUserForm] = useState<UserRow & { zonesArr: string[] }>({ name: "", email: "", role: "Citizen", zones: "", lastLogin: "", status: "Active", zonesArr: [] });

  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [scopeForm, setScopeForm] = useState<Scope>({ label: "", description: "", inheritedFrom: "", allowedRoles: [], count: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const resUsers = await api.get("/admin/list-users-for-admin");
      const list = resUsers.data || [];
      
      // 2. Fetch HubStaff/Employees
      let hubStaffList = [];
      try {
        const resHub = await api.get("/HubStaff/allHubStaff");
        hubStaffList = resHub.data || [];
      } catch (e) {
        console.error("Failed to load hub staff list:", e);
      }

      // Map Citizen/Drivers/Admins from users list
      const mappedUsers: UserRow[] = list.map((u: any) => {
        const rawRole = String(u.role || "").toLowerCase();
        let displayRole = "Citizen";
        if (rawRole === "admin") displayRole = "Admin";
        else if (rawRole === "manager") displayRole = "Manager";
        else if (rawRole === "driver" || rawRole === "recycler") displayRole = "Driver";

        return {
          name: u.fullName || "Citizen User",
          email: u.email || "no-email@example.com",
          role: displayRole,
          zones: u.address || "All",
          lastLogin: u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "Just now",
          status: "Active",
          userId: u.userId,
        };
      });

      // Map HubStaff list as Employees/Managers
      hubStaffList.forEach((h: any) => {
        mappedUsers.push({
          name: h.fullName || h.userName || `Employee #${h.id}`,
          email: h.email || `employee${h.id}@smartwaste.com`,
          role: "Manager",
          zones: "Cairo Hub Center",
          lastLogin: "Active",
          status: "Active",
          userId: h.id,
        });
      });

      setUsers(mappedUsers);

      // Recalculate dynamic role counts
      const counts: Record<string, number> = {
        Admin: mappedUsers.filter(u => u.role?.toLowerCase() === "admin").length || 1,
        Manager: mappedUsers.filter(u => u.role?.toLowerCase() === "manager" || u.role?.toLowerCase() === "employee").length || 1,
        Driver: mappedUsers.filter(u => u.role?.toLowerCase() === "driver" || u.role?.toLowerCase() === "recycler").length || 2,
        Citizen: mappedUsers.filter(u => u.role?.toLowerCase() === "citizen" || u.role?.toLowerCase() === "user").length || 5,
      };

      setRoles([
        { name: "Admin", desc: "Full system access", users: counts.Admin, perms: 28, accent: "violet" },
        { name: "Manager", desc: "Zone-scoped operations", users: counts.Manager, perms: 18, accent: "emerald" },
        { name: "Driver", desc: "Mobile field access", users: counts.Driver, perms: 6, accent: "sky" },
        { name: "Citizen", desc: "Self-service portal", users: counts.Citizen, perms: 3, accent: "amber" },
      ]);

    } catch (error) {
      console.error("Failed to load permissions page data:", error);
      toast.error("Failed to load users & permissions data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRoleEdit = (r: Role) => {
    const levels: Record<string, Level> = {};
    RESOURCES.forEach((res) => { levels[res] = matrix[res]?.[r.name] || "None"; });
    setRoleForm({ name: r.name, desc: r.desc, levels });
    setEditingRole(r);
  };

  const saveRole = () => {
    if (!editingRole) return;
    setRoles(roles.map((r) => r.name === editingRole.name ? { ...r, desc: roleForm.desc } : r));
    const nextMatrix: Matrix = { ...matrix };
    RESOURCES.forEach((res) => {
      nextMatrix[res] = { ...nextMatrix[res], [editingRole.name]: roleForm.levels[res] };
    });
    setMatrix(nextMatrix);
    addNotification({ title: "Role updated", body: `${editingRole.name} permissions modified`, severity: "info", icon: "ShieldCheck", link: "/permissions" });
    toast.success(`${editingRole.name} updated`);
    setEditingRole(null);
  };

  const cycleCell = (resource: string, roleName: string) => {
    if (!isAdmin) return;
    const cur = matrix[resource]?.[roleName] || "None";
    const idx = LEVELS.indexOf(cur);
    const next = LEVELS[(idx + 1) % LEVELS.length];
    setMatrix({ ...matrix, [resource]: { ...matrix[resource], [roleName]: next } });
    addNotification({ title: "Permission changed", body: `${resource} · ${roleName}: ${cur} → ${next}`, severity: "info", icon: "ShieldCheck", link: "/permissions" });
    toast.info(`${resource} · ${roleName}: ${next}`);
  };

  const openUserEdit = (u: UserRow) => {
    setUserForm({ ...u, zonesArr: u.zones === "All" ? [...ALL_ZONES] : u.zones.split(",").map((s) => s.trim()).filter(Boolean) });
    setEditingUser(u);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const targetUserId = editingUser.userId;
      const zonesStr = userForm.zonesArr.length === ALL_ZONES.length ? "All" : userForm.zonesArr.join(", ");

      if (targetUserId && (userForm.role?.toLowerCase() === "citizen" || userForm.role?.toLowerCase() === "user")) {
        await api.put(`/User/UpdateUser/${targetUserId}`, {
          fullName: userForm.name,
          email: userForm.email,
          address: zonesStr,
          phone: "01000000000",
        });
      }

      setUsers(users.map((u) => u.email === editingUser.email ? { ...u, name: userForm.name, role: userForm.role, zones: zonesStr, status: userForm.status } : u));
      addNotification({ title: "User updated", body: `${userForm.name} (${userForm.role})`, severity: "info", icon: "Users", link: "/permissions" });
      toast.success(`${userForm.name} updated`);
      setEditingUser(null);
    } catch (err: any) {
      console.error("Failed to update user on server:", err);
      toast.error(err.response?.data?.message || "Failed to save user updates");
    }
  };

  const openScopeEdit = (s: Scope) => { setScopeForm(s); setEditingScope(s); };
  const saveScope = () => {
    if (!editingScope) return;
    setScopes(scopes.map((s) => s.label === editingScope.label ? scopeForm : s));
    addNotification({ title: "Scope updated", body: scopeForm.label, severity: "info", icon: "Layers", link: "/permissions" });
    toast.success(`Scope updated`);
    setEditingScope(null);
  };

  const toggleReview = (q: string) => {
    setReviews(reviews.map((r) => r.quarter === q ? { ...r, status: r.status === "Complete" ? "In progress" : "Complete", completed: r.status === "Complete" ? r.completed : 100 } : r));
    const r = reviews.find((x) => x.quarter === q);
    addNotification({ title: "Access review updated", body: `${q} marked ${r?.status === "Complete" ? "in progress" : "complete"}`, severity: "success", icon: "ClipboardCheck", link: "/permissions" });
    toast.success(`${q} updated`);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mc-fade-in-down">
        <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Permissions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">Roles, users, scopes, and quarterly access reviews</p>
        </div>
      </div>

      <GlassCard className="p-2 flex flex-wrap gap-1">
        {TABS.map((t) => {
          const Icon = t.Icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 h-10 rounded-full text-sm transition-colors cursor-pointer ${active ? "bg-emerald-600 text-white" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </GlassCard>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium text-lg">Loading roles and user permissions from database...</p>
          </div>
        </div>
      ) : (
        <>
          {tab === "roles" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((r, i) => {
                  const a = accentMap[r.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600" };
                  return (
                    <div key={r.name} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
                      <GlassCard className="p-5">
                        <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                          <ShieldCheck className={`w-6 h-6 ${a.fg}`} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{r.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</p>
                        <div className="flex items-center gap-4 mt-4 text-sm">
                          <div><span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{r.users}</span> <span className="text-slate-500 dark:text-slate-400">users</span></div>
                          <div><span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{r.perms}</span> <span className="text-slate-500 dark:text-slate-400">perms</span></div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => openRoleEdit(r)} className="mt-4 w-full flex items-center justify-center gap-2 h-9 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                            <Edit3 className="w-4 h-4" /> Edit
                          </button>
                        )}
                      </GlassCard>
                    </div>
                  );
                })}
              </div>

              <GlassCard className="p-6 overflow-x-auto">
                <h3 className="text-lg tracking-tight text-slate-900 dark:text-white mb-1">Permissions Matrix</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{isAdmin ? "Click a cell to cycle None → Read → Write → Admin" : "Resource access by role"}</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                      <th className="px-3 py-2">Resource</th>
                      {roles.map((r) => <th key={r.name} className="px-3 py-2">{r.name}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {RESOURCES.map((res) => (
                      <tr key={res}>
                        <td className="px-3 py-3 text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{res}</td>
                        {roles.map((r) => {
                          const lvl = matrix[res]?.[r.name] || "None";
                          return (
                            <td key={r.name} className="px-3 py-3">
                              <button onClick={() => cycleCell(res, r.name)} disabled={!isAdmin} className={`px-3 py-1 rounded-full text-xs ${pillAccent[lvl]} ${isAdmin ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}>{lvl}</button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            </div>
          )}

          {tab === "users" && (
            <GlassCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/60 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                    <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Zones</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {users.map((u) => (
                      <tr key={u.email} className="hover:bg-slate-50/40 dark:hover:bg-white/5">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <UserCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{u.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300">{u.role}</span></td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.zones}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{u.lastLogin}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${u.status === "Active" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-slate-500/10 text-slate-500 dark:text-slate-400"}`}>{u.status}</span></td>
                        <td className="px-4 py-3 text-right">
                          {isAdmin && (
                            <button onClick={() => openUserEdit(u)} className="px-3 h-8 text-xs bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-700 dark:text-slate-200 cursor-pointer">Edit</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {tab === "scopes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scopes.map((s, i) => (
                <div key={s.label} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <GlassCard className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{s.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Inherits from {s.inheritedFrom} · {s.count} permissions</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => openScopeEdit(s)} className="px-3 h-8 text-xs bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-700 dark:text-slate-200 cursor-pointer">Edit</button>
                    )}
                  </GlassCard>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <div key={r.quarter} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                          <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{r.quarter} Access Review</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Reviewer: {r.reviewer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${r.status === "Complete" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : r.status === "In progress" ? "bg-sky-500/10 text-sky-700 dark:text-sky-300" : "bg-slate-500/10 text-slate-700 dark:text-slate-300"}`}>{r.status}</span>
                        {isAdmin && (
                          <button onClick={() => toggleReview(r.quarter)} className="px-3 h-8 text-xs bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full text-slate-700 dark:text-slate-200 cursor-pointer">
                            {r.status === "Complete" ? "Reopen" : "Mark Complete"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>{r.completed}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 mc-bar-fill" style={{ "--bar-width": `${r.completed}%` } as React.CSSProperties} />
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {editingRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingRole(null)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto mc-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Edit Role</h2>
              <button onClick={() => setEditingRole(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Role name</span>
                <input value={roleForm.name} readOnly className={`${inputCls} opacity-70`} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Description</span>
                <input value={roleForm.desc} onChange={(e) => setRoleForm({ ...roleForm, desc: e.target.value })} className={inputCls} />
              </label>
              <div className="pt-2 space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300" style={{ fontWeight: 600 }}>Permissions</p>
                {RESOURCES.map((res) => (
                  <div key={res} className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{res}</span>
                    <select value={roleForm.levels[res]} onChange={(e) => setRoleForm({ ...roleForm, levels: { ...roleForm.levels, [res]: e.target.value as Level } })} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditingRole(null)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={saveRole} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto mc-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Edit User</h2>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</span>
                <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Email</span>
                <input value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Role</span>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className={inputCls}>
                  {roles.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Status</span>
                <select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })} className={inputCls}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <div>
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Zones</span>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ZONES.map((z) => {
                    const checked = userForm.zonesArr.includes(z);
                    return (
                      <label key={z} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input type="checkbox" checked={checked} onChange={(e) => setUserForm({ ...userForm, zonesArr: e.target.checked ? [...userForm.zonesArr, z] : userForm.zonesArr.filter((x) => x !== z) })} className="accent-emerald-600" />
                        {z}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditingUser(null)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={saveUser} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {editingScope && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingScope(null)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10 mc-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Edit Scope</h2>
              <button onClick={() => setEditingScope(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</span>
                <input value={scopeForm.label} onChange={(e) => setScopeForm({ ...scopeForm, label: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Description</span>
                <input value={scopeForm.description} onChange={(e) => setScopeForm({ ...scopeForm, description: e.target.value })} className={inputCls} />
              </label>
              <div>
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Allowed roles</span>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const checked = scopeForm.allowedRoles.includes(r.name);
                    return (
                      <label key={r.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input type="checkbox" checked={checked} onChange={(e) => setScopeForm({ ...scopeForm, allowedRoles: e.target.checked ? [...scopeForm.allowedRoles, r.name] : scopeForm.allowedRoles.filter((x) => x !== r.name) })} className="accent-emerald-600" />
                        {r.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditingScope(null)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={saveScope} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

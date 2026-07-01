"use client";

import { useState } from "react";
import { Search, Shield, Truck, UserCircle2, Users, Phone } from "lucide-react";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import { DataTable, Column } from "@/components/DataTable";
import { GlassCard } from "@/app/components/GlassCard";
import { toast } from "sonner";

// ========== أنواع البيانات ==========
type Role = "admin" | "driver" | "citizen" | "employee";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  status: "active" | "inactive";
  prints: number;
}

// ========== بيانات تجريبية ==========
const MOCK_USERS: User[] = [
  { id: "U1",  name: "Ahmed Hassan",   phone: "01012345678", email: "ahmed@ecovision.io",   role: "admin",    status: "active",   prints: 45 },
  { id: "U2",  name: "Sara Mohamed",   phone: "01023456789", email: "sara@ecovision.io",    role: "admin",    status: "active",   prints: 32 },
  { id: "U3",  name: "Khaled Ibrahim", phone: "01034567890", email: "khaled@ecovision.io",  role: "driver",   status: "active",   prints: 128 },
  { id: "U4",  name: "Omar Samir",     phone: "01045678901", email: "omar@ecovision.io",    role: "driver",   status: "active",   prints: 95 },
  { id: "U5",  name: "Nour Ali",       phone: "01056789012", email: "nour@ecovision.io",    role: "driver",   status: "inactive", prints: 12 },
  { id: "U6",  name: "Fatma Khaled",   phone: "01067890123", email: "fatma@ecovision.io",   role: "employee", status: "active",   prints: 67 },
  { id: "U7",  name: "Youssef Tarek",  phone: "01078901234", email: "youssef@ecovision.io", role: "employee", status: "active",   prints: 43 },
  { id: "U8",  name: "Layla Mostafa",  phone: "01089012345", email: "layla@ecovision.io",   role: "citizen",  status: "active",   prints: 8 },
  { id: "U9",  name: "Mahmoud Adel",   phone: "01090123456", email: "mahmoud@ecovision.io", role: "citizen",  status: "active",   prints: 15 },
  { id: "U10", name: "Rania Hossam",   phone: "01001234567", email: "rania@ecovision.io",   role: "citizen",  status: "inactive", prints: 3 },
];

// ========== إعدادات الرول ==========
const roleConfig: Record<Role, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  admin:    { label: "Admin",    icon: Shield,      variant: "default" },
  driver:   { label: "Driver",   icon: Truck,       variant: "secondary" },
  employee: { label: "Employee", icon: UserCircle2, variant: "outline" },
  citizen:  { label: "Citizen",  icon: Users,       variant: "secondary" },
};

// ========== المكون الرئيسي ==========
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  // ========== فلترة ==========
const filtered = users.filter((u) => {
  return (
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()) ||
     u.phone.includes(search)) &&
    (roleFilter === "all" || u.role === roleFilter)
  );
});

  // ========== إحصائيات ==========
  const stats = [
    { label: "Total", value: users.length },
    { label: "Active", value: users.filter(u => u.status === "active").length },
    { label: "Admins", value: users.filter(u => u.role === "admin").length },
    { label: "Drivers", value: users.filter(u => u.role === "driver").length },
  ];

  // ========== عمليات ==========
  const handleEdit = (user: User) => {
    toast.info(`Edit ${user.name}`);
    // router.push(`/users/${user.id}/edit`);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
      toast.success(`${user.name} deleted`);
    }
  };

  const handleToggleStatus = (user: User) => {
    setUsers(users.map((u) =>
      u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));
    toast.success(`${user.name} ${user.status === "active" ? "deactivated" : "activated"}`);
  };

  // ========== الأعمدة ==========
  const columns: Column<User>[] = [
    {
      key: "id",
      header: "ID",
      className: "font-mono text-xs",
      render: (u) => <span className="text-slate-400">#{u.id}</span>,
    },
    {
      key: "name",
      header: "Full Name",
      render: (u) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3" /> {u.phone}
          </p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "hidden md:table-cell",
      render: (u) => <span className="text-slate-600 dark:text-slate-400">{u.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u) => {
        const rc = roleConfig[u.role];
        const Icon = rc.icon;
        return (
          <Badge variant={rc.variant} className="gap-1">
            <Icon className="w-3 h-3" />
            {rc.label}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={u.status === "active" ? "default" : "secondary"}>
          {u.status === "active" ? "● Active" : "○ Inactive"}
        </Badge>
      ),
    },
    {
      key: "prints",
      header: "Points",
      className: "hidden lg:table-cell text-center",
      render: (u) => {
        if (u.role !== "citizen") {
          return <span className="text-slate-400">-</span>;
        }
        return <span className="font-bold">{u.prints}</span>;
      },
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage all platform users
        </p>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* فلاتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex gap-1 p-1 bg-slate-100/70 dark:bg-white/[0.04] rounded-full border">
          {(["all", "admin", "driver", "employee", "citizen"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                roleFilter === r
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {r === "all" ? "All" : roleConfig[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* الجدول */}
      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(u) => u.id}
        showEdit
        onEdit={handleEdit}
        showDelete
        onDelete={handleDelete}
        actions={[
          {
            label: "Toggle Status",
            icon: <Shield className="w-4 h-4" />,
            onClick: handleToggleStatus,
          },
        ]}
        emptyMessage="No users match your filters"
      />

      {/* Footer */}
      <div className="text-xs text-slate-400">
        Showing {filtered.length} of {users.length} users
      </div>
    </div>
  );
}

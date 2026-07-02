"use client";

import { useState } from "react";
import "@/app/components/motion/motion-components.css";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Package,
  Users,
  Truck,
  Plus,
  CheckCircle,
  Recycle,
  Factory,
  Zap,
  X,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useRoleContext } from "@/contexts/RoleContext";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import { usePartners, type Partner, type PartnerType, type PartnerStatus } from "@/app/contexts/PartnersContext";
import { useNotifications } from "@/app/contexts/NotificationContext";

const typeAccent: Record<PartnerType, { bg: string; fg: string; gradient: string; icon: any; label: string }> = {
  logistics: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400", gradient: "from-sky-500 to-cyan-600", icon: Truck, label: "Logistics" },
  retail: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", gradient: "from-amber-500 to-orange-600", icon: Building2, label: "Retail" },
  manufacturer: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-teal-600", icon: Factory, label: "Manufacturer" },
  ngo: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400", gradient: "from-violet-500 to-fuchsia-600", icon: Recycle, label: "NGO" },
};

const statusAccent: Record<PartnerStatus, { bg: string; fg: string; dot: string }> = {
  active: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  paused: { bg: "bg-slate-500/10", fg: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
};

const inputCls =
  "w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

export default function PartnersPage() {
  const { role: currentRole } = useRoleContext();
  const { partners, addPartner, updatePartner, removePartner, assignShipment } = usePartners();
  const { addNotification } = useNotifications();

  const canManage = !(currentRole === "citizen" || currentRole === "driver");

  const [filterType, setFilterType] = useState<"all" | PartnerType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | PartnerStatus>("all");

  const emptyForm = {
    name: "",
    type: "logistics" as PartnerType,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  };
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [shipFor, setShipFor] = useState<Partner | null>(null);
  const [shipForm, setShipForm] = useState({ weightKg: 0, date: new Date().toISOString().slice(0, 10) });

  const filtered = partners.filter((p) => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  const activePartners = partners.filter((p) => p.status === "active").length;
  const totalVolume = partners.reduce((s, p) => s + p.totalVolumeKg, 0);
  const totalShipments = partners.reduce((s, p) => s + p.shipmentsCount, 0);

  const kpis = [
    { label: "Total Partners", value: partners.length, sub: `${activePartners} active`, icon: Building2, accent: "emerald" },
    { label: "Volume Processed", value: `${(totalVolume / 1000).toFixed(1)}t`, sub: "across all partners", icon: Recycle, accent: "sky" },
    { label: "Shipments", value: totalShipments, sub: "lifetime total", icon: Truck, accent: "violet" },
    { label: "Active Partners", value: activePartners, sub: "currently engaged", icon: Zap, accent: "amber" },
  ];

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Partner) => {
    setEditingId(p.id);
    setForm({ name: p.name, type: p.type, contactName: p.contactName, contactEmail: p.contactEmail, contactPhone: p.contactPhone });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("Name required"); return; }
    if (!form.contactEmail.trim()) { toast.error("Email required"); return; }
    if (editingId) {
      updatePartner(editingId, form);
      addNotification({ title: "Partner updated", body: `${form.name} was updated.`, severity: "info", icon: "Building2", link: "/partners" });
      toast.success(`Updated ${form.name}`);
    } else {
      addPartner({
        ...form,
        status: "active",
        shipmentsCount: 0,
        totalVolumeKg: 0,
        joinDate: new Date().toISOString().slice(0, 10),
        lastShipment: "—",
      });
      addNotification({ title: "Partner added", body: `${form.name} joined as a partner.`, severity: "success", icon: "Building2", link: "/partners" });
      toast.success(`Added ${form.name}`);
    }
    closeForm();
  };

  const handleDelete = () => {
    if (!editingId) return;
    if (!window.confirm("Delete partner?")) return;
    const name = form.name;
    removePartner(editingId);
    addNotification({ title: "Partner removed", body: `${name} was removed.`, severity: "warning", icon: "Building2", link: "/partners" });
    toast.success(`Deleted ${name}`);
    closeForm();
  };

  const openAssign = (p: Partner) => {
    setShipFor(p);
    setShipForm({ weightKg: 0, date: new Date().toISOString().slice(0, 10) });
  };

  const handleAssign = () => {
    if (!shipFor) return;
    if (shipForm.weightKg <= 0) { toast.error("Weight must be positive"); return; }
    assignShipment(shipFor.id, shipForm);
    addNotification({ title: "Shipment assigned", body: `${shipForm.weightKg}kg shipment routed to ${shipFor.name}.`, severity: "success", icon: "Truck", link: "/partners" });
    toast.success(`Shipment assigned to ${shipFor.name}`);
    setShipFor(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>B2B Partners</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Manage industrial recycling partnerships & shipment routing
            </p>
          </div>
        </div>
        {canManage && (
          <button onClick={openAdd} className="flex items-center gap-2 px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          const a = accentMap[k.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" };
          return (
            <div key={k.label} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{k.value}</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5" style={{ fontWeight: 600 }}>{k.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{k.sub}</p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Filter:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-full p-1">
            {(["all", "logistics", "retail", "manufacturer", "ngo"] as const).map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all cursor-pointer ${
                  filterType === t ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                style={{ fontWeight: 600 }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-full p-1">
            {(["all", "active", "pending", "paused"] as const).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all cursor-pointer ${
                  filterStatus === s ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                style={{ fontWeight: 600 }}
              >
                {s}
              </button>
            ))}
          </div>
          {(filterType !== "all" || filterStatus !== "all") && (
            <button onClick={() => { setFilterType("all"); setFilterStatus("all"); }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer" style={{ fontWeight: 600 }}>
              Clear filters
            </button>
          )}
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <GlassCard className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>No Partners Found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
            No B2B partners match the selected filters.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p, i) => {
            const tA = typeAccent[p.type];
            const sA = statusAccent[p.status];
            const TypeIcon = tA.icon;
            const initials = p.name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
            return (
              <div key={p.id} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.04}s` }}>
                <GlassCard className="overflow-hidden">
                  <div className={`bg-gradient-to-r ${tA.gradient} p-5`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-lg" style={{ fontWeight: 600 }}>
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-white" style={{ fontWeight: 600 }}>{p.name}</h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded-full text-xs bg-white/20 text-white" style={{ fontWeight: 600 }}>
                            <TypeIcon className="w-3 h-3" />
                            {tA.label}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/20 text-white capitalize" style={{ fontWeight: 600 }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sA.dot}`} />
                        {p.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1"><Package className="w-3.5 h-3.5" />Shipments</div>
                        <p className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{p.shipmentsCount}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1"><Recycle className="w-3.5 h-3.5" />Volume</div>
                        <p className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{(p.totalVolumeKg / 1000).toFixed(2)}t</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{p.contactName}</div>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><a href={`mailto:${p.contactEmail}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">{p.contactEmail}</a></div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{p.contactPhone}</div>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" />Joined {p.joinDate}</div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />Last shipment: {p.lastShipment}</div>
                    </div>

                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAssign(p)}
                          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-full text-sm bg-gradient-to-r ${tA.gradient} text-white hover:shadow-lg cursor-pointer`}
                          style={{ fontWeight: 600 }}
                        >
                          <Truck className="w-4 h-4" />
                          Assign Shipment
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      )}

      <div className="mc-card-in" style={{ animationDelay: "0.4s" }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Recent Activity</h3>
            <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
              {totalShipments} shipments
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Latest partner shipments</p>
          <div className="space-y-2">
            {partners.slice(0, 5).map((p) => {
              const tA = typeAccent[p.type];
              const initials = p.name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tA.gradient} flex items-center justify-center text-white text-xs`} style={{ fontWeight: 600 }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{p.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {p.shipmentsCount} shipments · {(p.totalVolumeKg / 1000).toFixed(2)} t · last {p.lastShipment}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeForm}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{editingId ? "Edit Partner" : "Add Partner"}</h2>
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
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Type</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PartnerType })} className={inputCls}>
                  <option value="logistics">Logistics</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="ngo">NGO</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Contact Name</span>
                <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Contact Email</span>
                <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Contact Phone</span>
                <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between gap-2">
              <div>
                {editingId && (
                  <button onClick={handleDelete} className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm cursor-pointer" style={{ fontWeight: 600 }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={closeForm} className="h-10 px-5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
                <button onClick={handleSubmit} className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer" style={{ fontWeight: 600 }}>{editingId ? "Save" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shipFor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShipFor(null)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Assign Shipment</h2>
              <button onClick={() => setShipFor(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Routing to <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{shipFor.name}</span></p>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Weight (kg)</span>
                <input type="number" min={0} value={shipForm.weightKg} onChange={(e) => setShipForm({ ...shipForm, weightKg: Number(e.target.value) })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Date</span>
                <input type="date" value={shipForm.date} onChange={(e) => setShipForm({ ...shipForm, date: e.target.value })} className={inputCls} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShipFor(null)} className="h-10 px-5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={handleAssign} className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer" style={{ fontWeight: 600 }}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

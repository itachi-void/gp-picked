"use client";

import { useMemo, useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import { CalendarClock, ChevronLeft, ChevronRight, Plus, Filter, Download, MapPin, Truck, Package, X, Trash2 } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useNotifications } from "@/app/contexts/NotificationContext";
import api from "@/lib/axios";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCKS = ["AM", "PM"] as const;
const MATERIALS = ["PET", "Paper", "Glass", "Metal", "Organic", "HDPE"];

type Pickup = { id: string; day: number; block: "AM" | "PM"; time: string; date: string; zone: string; driver: string; material: string; accent: string };
type Unassigned = { id: string; zone: string; material: string; priority: string };

const materialAccent: Record<string, string> = {
  PET: "emerald", Paper: "lime", Glass: "teal", Metal: "amber", Organic: "sky", HDPE: "sky",
};

const seedScheduled: Pickup[] = [
  { id: "P-201", day: 0, block: "AM", time: "08:30", date: "", zone: "Downtown", driver: "Mike T.", material: "PET", accent: "emerald" },
  { id: "P-202", day: 0, block: "PM", time: "14:00", date: "", zone: "Riverside", driver: "Omar S.", material: "Glass", accent: "teal" },
  { id: "P-203", day: 1, block: "AM", time: "09:15", date: "", zone: "Harbor", driver: "Ahmed H.", material: "HDPE", accent: "sky" },
  { id: "P-204", day: 1, block: "PM", time: "13:00", date: "", zone: "Old City", driver: "Khaled H.", material: "Paper", accent: "lime" },
  { id: "P-205", day: 2, block: "AM", time: "07:45", date: "", zone: "Downtown", driver: "Mike T.", material: "Metal", accent: "amber" },
  { id: "P-206", day: 2, block: "PM", time: "15:30", date: "", zone: "North", driver: "Mohamed A.", material: "PET", accent: "emerald" },
  { id: "P-207", day: 3, block: "AM", time: "10:00", date: "", zone: "East", driver: "Omar S.", material: "Glass", accent: "teal" },
  { id: "P-208", day: 3, block: "PM", time: "14:45", date: "", zone: "South", driver: "Ahmed H.", material: "Paper", accent: "lime" },
  { id: "P-209", day: 4, block: "AM", time: "08:00", date: "", zone: "Central", driver: "Khaled H.", material: "PET", accent: "emerald" },
  { id: "P-210", day: 4, block: "PM", time: "13:30", date: "", zone: "Riverside", driver: "Mohamed A.", material: "Metal", accent: "amber" },
  { id: "P-211", day: 5, block: "AM", time: "09:30", date: "", zone: "Harbor", driver: "Mike T.", material: "HDPE", accent: "sky" },
  { id: "P-212", day: 5, block: "PM", time: "16:00", date: "", zone: "Old City", driver: "Omar S.", material: "Glass", accent: "teal" },
  { id: "P-213", day: 6, block: "AM", time: "10:15", date: "", zone: "Downtown", driver: "Ahmed H.", material: "PET", accent: "emerald" },
];

const seedUnassigned: Unassigned[] = [
  { id: "U-301", zone: "Downtown", material: "PET", priority: "Critical" },
  { id: "U-302", zone: "Harbor", material: "Glass", priority: "High" },
  { id: "U-303", zone: "East", material: "Paper", priority: "Normal" },
  { id: "U-304", zone: "South", material: "Metal", priority: "Normal" },
];

const accentBg: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  teal: "bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300",
  sky: "bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300",
  lime: "bg-lime-500/10 border-lime-500/30 text-lime-700 dark:text-lime-300",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
};

const inputCls = "w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

function pad(n: number) { return String(n).padStart(2, "0"); }
function toIcsDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function buildIcs(pickups: Pickup[]): string {
  const now = toIcsDate(new Date());
  const events = pickups.map((p) => {
    const base = p.date ? new Date(p.date + "T" + p.time + ":00") : new Date();
    if (!p.date) {
      const monday = new Date();
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      monday.setDate(monday.getDate() + p.day);
      const [h, m] = p.time.split(":").map(Number);
      monday.setHours(h, m, 0, 0);
      base.setTime(monday.getTime());
    }
    const end = new Date(base.getTime() + 30 * 60_000);
    return [
      "BEGIN:VEVENT",
      `UID:${p.id}@ecovoid`,
      `DTSTAMP:${now}`,
      `DTSTART:${toIcsDate(base)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${p.material} pickup — ${p.zone}`,
      `LOCATION:${p.zone}`,
      `DESCRIPTION:Driver: ${p.driver}`,
      "END:VEVENT",
    ].join("\r\n");
  }).join("\r\n");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//EcoVoid//Schedule//EN", events, "END:VCALENDAR"].join("\r\n");
}

export default function SchedulePage() {
  const { role, user } = useRoleContext();
  const { addNotification } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterZone, setFilterZone] = useState("all");
  const [filterDriver, setFilterDriver] = useState("all");
  const [scheduled, setScheduled] = useLocalStorage<Pickup[]>("ecovoid.schedule.v1", seedScheduled);
  const [unassigned, setUnassigned] = useLocalStorage<Unassigned[]>("ecovoid.schedule.unassigned.v1", seedUnassigned);
  const [driverList, setDriverList] = useState<{ id: number; name: string }[]>([]);

  const [creating, setCreating] = useState(false);
  const [details, setDetails] = useState<Pickup | null>(null);
  const [assigning, setAssigning] = useState<Unassigned | null>(null);
  const [assignDay, setAssignDay] = useState(0);
  const [assignBlock, setAssignBlock] = useState<"AM" | "PM">("AM");
  const [assignTime, setAssignTime] = useState("09:00");
  const [assignDriver, setAssignDriver] = useState("");

  const todayIso = new Date().toISOString().slice(0, 10);
  const emptyForm: Pickup = { id: "", day: 0, block: "AM", time: "09:00", date: todayIso, zone: "", driver: "", material: "PET", accent: "emerald" };
  const [form, setForm] = useState<Pickup>(emptyForm);

  const rawRole = role?.toLowerCase() ?? "user";
  const isCitizen = rawRole === "user" || rawRole === "citizen";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get("/admin/recyclers-details");
        const list = Array.isArray(res.data) ? res.data : [];
        setDriverList(list.map((d: any) => ({ id: d.recyclerID || d.id, name: d.fullName || d.name })));
      } catch {
        setDriverList([]);
      }
    };
    if (mounted) {
      fetchDrivers();
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-full mt-2" />
      </div>
    );
  }

  const zones = Array.from(new Set(scheduled.map((p) => p.zone)));
  const driverNames = Array.from(new Set([...scheduled.map((p) => p.driver), ...driverList.map((d) => d.name)]));

  const filtered = useMemo(
    () => scheduled.filter((p) => (filterZone === "all" || p.zone === filterZone) && (filterDriver === "all" || p.driver === filterDriver)),
    [scheduled, filterZone, filterDriver]
  );

  const weekLabel = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(monday)} – ${fmt(sunday)}`;
  }, [weekOffset]);

  const handleCreate = () => {
    if (!form.zone.trim() || !form.driver.trim()) { toast.error("Zone and driver required"); return; }
    const dayIdx = form.date ? ((new Date(form.date).getDay() + 6) % 7) : form.day;
    const newPickup: Pickup = { ...form, id: `P-${Date.now().toString().slice(-4)}`, day: dayIdx, accent: materialAccent[form.material] || "emerald" };
    setScheduled([...scheduled, newPickup]);
    setCreating(false);
    setForm(emptyForm);
    addNotification({ title: "Pickup scheduled", body: `${newPickup.material} pickup at ${newPickup.zone} (${DAYS[newPickup.day]} ${newPickup.block})`, severity: "info", icon: "CalendarClock", link: "/schedule" });
    toast.success("Pickup scheduled");
  };

  const handleDelete = (id: string) => {
    const p = scheduled.find((x) => x.id === id);
    setScheduled(scheduled.filter((x) => x.id !== id));
    setDetails(null);
    addNotification({ title: "Pickup removed", body: `${p?.id} ${p?.zone}`, severity: "warning", icon: "Trash2", link: "/schedule" });
    toast.success(`Removed ${p?.id}`);
  };

  const handleAssign = () => {
    if (!assigning) return;
    if (!assignDriver) { toast.error("Pick a driver"); return; }
    const newPickup: Pickup = {
      id: `P-${Date.now().toString().slice(-4)}`,
      day: assignDay, block: assignBlock, time: assignTime, date: "",
      zone: assigning.zone, driver: assignDriver, material: assigning.material,
      accent: materialAccent[assigning.material] || "emerald",
    };
    setScheduled([...scheduled, newPickup]);
    setUnassigned(unassigned.filter((u) => u.id !== assigning.id));
    addNotification({ title: "Unassigned scheduled", body: `${assigning.id} → ${DAYS[assignDay]} ${assignBlock} (${assignDriver})`, severity: "success", icon: "CalendarClock", link: "/schedule" });
    toast.success(`Assigned ${assigning.id}`);
    setAssigning(null);
  };

  const handleExportIcs = () => {
    const ics = buildIcs(scheduled);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecovoid-schedule.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification({ title: "Calendar exported", body: `${scheduled.length} events written to ecovoid-schedule.ics`, severity: "success", icon: "Download", link: "/schedule" });
    toast.success("Calendar exported");
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center">
            <CalendarClock className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Schedule</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Weekly pickup calendar across zones and drivers</p>
          </div>
        </div>
      </div>

      <GlassCard className="p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="w-9 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={() => setWeekOffset(0)} className="px-3 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">Today</button>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="w-9 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="ml-3 text-sm text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>{weekLabel}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterZone} onChange={(e) => setFilterZone(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">All zones</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <select value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)} className="h-9 px-3 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">All drivers</option>
            {driverNames.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {!isCitizen && (
            <button onClick={() => { setForm(emptyForm); setCreating(true); }} className="flex items-center gap-2 px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm">
              <Plus className="w-4 h-4" /> Add pickup
            </button>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <GlassCard className="p-4 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-2">
              <div></div>
              {DAYS.map((d) => (
                <div key={d} className="text-xs text-center text-slate-500 dark:text-slate-400 py-2" style={{ fontWeight: 600 }}>{d}</div>
              ))}
            </div>
            {BLOCKS.map((block) => (
              <div key={block} className="grid grid-cols-[60px_repeat(7,1fr)] gap-2 mb-2">
                <div className="flex items-start justify-end pr-2 pt-2 text-xs text-slate-500 dark:text-slate-400">{block}</div>
                {DAYS.map((_, dayIdx) => {
                  const items = filtered.filter((p) => p.day === dayIdx && p.block === block);
                  return (
                    <div key={dayIdx} className="min-h-[110px] bg-slate-50/60 dark:bg-white/5 rounded-2xl p-2 space-y-1.5">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className={`mc-scale-in hover-lift p-2 rounded-xl border text-xs cursor-pointer ${accentBg[p.accent] || accentBg.emerald}`}
                          onClick={() => setDetails(p)}
                        >
                          <div className="flex items-center justify-between">
                            <span style={{ fontWeight: 600 }}>{p.time}</span>
                            <span className="opacity-70">{p.material}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 opacity-80"><MapPin className="w-3 h-3" />{p.zone}</div>
                          <div className="flex items-center gap-1 opacity-80"><Truck className="w-3 h-3" />{p.driver}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Unassigned</h3>
            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{unassigned.length}</span>
          </div>
          <div className="space-y-2">
            {unassigned.map((u) => (
              <div key={u.id} className="p-3 bg-slate-50/60 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => { if (isCitizen) return; setAssigning(u); setAssignDay(0); setAssignBlock("AM"); setAssignTime("09:00"); setAssignDriver(driverList[0]?.name || ""); }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{u.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.priority === "Critical" ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : u.priority === "High" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-sky-500/10 text-sky-700 dark:text-sky-300"}`}>{u.priority}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{u.zone} · {u.material}</p>
              </div>
            ))}
            {unassigned.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-400">All caught up.</p>}
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-end">
        <button onClick={handleExportIcs} className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-sm text-slate-700 dark:text-slate-200">
          <Download className="w-4 h-4" /> Export iCal
        </button>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Add Pickup</h2>
              <button onClick={() => setCreating(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Zone</span>
                <input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className={inputCls} placeholder="Downtown" />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Driver</span>
                <select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} className={inputCls}>
                  <option value="">Select a driver</option>
                  {driverList.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Material</span>
                <select value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={inputCls}>
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Date</span>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
                </label>
                <label className="block">
                  <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Block</span>
                  <select value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value as "AM" | "PM" })} className={inputCls}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Time</span>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputCls} />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setCreating(false)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">Cancel</button>
              <button onClick={handleCreate} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Create</button>
            </div>
          </div>
        </div>
      )}

      {details && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetails(null)}>
          <div className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{details.id}</h2>
              <button onClick={() => setDetails(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Zone</dt><dd className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{details.zone}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Driver</dt><dd className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{details.driver}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Material</dt><dd className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{details.material}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Day</dt><dd className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{DAYS[details.day]} {details.block}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Time</dt><dd className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>{details.time}</dd></div>
            </dl>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDetails(null)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">Close</button>
              {!isCitizen && (
                <button onClick={() => handleDelete(details.id)} className="px-4 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
              )}
            </div>
          </div>
        </div>
      )}

      {assigning && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAssigning(null)}>
          <div className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>Assign {assigning.id}</h2>
              <button onClick={() => setAssigning(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{assigning.zone} · {assigning.material} · {assigning.priority}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Day</span>
                  <select value={assignDay} onChange={(e) => setAssignDay(Number(e.target.value))} className={inputCls}>
                    {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Block</span>
                  <select value={assignBlock} onChange={(e) => setAssignBlock(e.target.value as "AM" | "PM")} className={inputCls}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Time</span>
                <input type="time" value={assignTime} onChange={(e) => setAssignTime(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Driver</span>
                <select value={assignDriver} onChange={(e) => setAssignDriver(e.target.value)} className={inputCls}>
                  <option value="">Select a driver</option>
                  {driverList.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setAssigning(null)} className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">Cancel</button>
              <button onClick={handleAssign} className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

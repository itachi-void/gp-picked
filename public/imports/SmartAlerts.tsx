"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Trash2,
  Eye,
  MoreVertical,
  Activity,
  Zap,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { card, accent, text, btn, input, status, progressBar } from "@/lib/dashboard-theme";
import { ConfigureAlertsModal } from "@/app/components/ConfigureAlertsModal";
import { useAlertsMonitor } from "@/hooks/useAlertsMonitor";
import { useAlertsConfig } from "@/app/contexts/AlertsConfigContext";

/* ── Types ── */
type AlertType = "critical" | "warning" | "info" | "success";

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  location: string;
  status: "active" | "resolved" | "pending";
  priority: "high" | "medium" | "low";
  fromGuard?: boolean;
}

/* ── Mock Data ── */
const mockAlerts: Alert[] = [
  { id: "1", type: "critical", title: "Center Capacity Critical", description: "Downtown Center has reached 95% capacity. Immediate action required.", time: "5 minutes ago", location: "Downtown Center", status: "active", priority: "high" },
  { id: "2", type: "warning", title: "Route Delay Detected", description: "Route A-5 is experiencing 30 minute delay due to traffic.", time: "15 minutes ago", location: "Route A-5", status: "active", priority: "medium" },
  { id: "3", type: "info", title: "New Driver Assigned", description: "John Smith has been assigned to Route B-3.", time: "1 hour ago", location: "Route B-3", status: "resolved", priority: "low" },
  { id: "4", type: "success", title: "Collection Completed", description: "North Center collection completed successfully — 850 bottles.", time: "2 hours ago", location: "North Center", status: "resolved", priority: "low" },
  { id: "5", type: "warning", title: "Maintenance Required", description: "Vehicle #12 requires scheduled maintenance check.", time: "3 hours ago", location: "Vehicle Fleet", status: "pending", priority: "medium" },
  { id: "6", type: "info", title: "System Update Available", description: "New software update available for all collection devices.", time: "5 hours ago", location: "System", status: "pending", priority: "low" },
];

/* ── Alert type → theme mapping ── */
const typeConfig: Record<AlertType, { icon: typeof AlertTriangle; gradient: string; statusKey: keyof typeof status }> = {
  critical: { icon: AlertTriangle, gradient: "from-red-500 to-orange-500", statusKey: "danger" },
  warning: { icon: AlertCircle, gradient: "from-amber-500 to-orange-400", statusKey: "warning" },
  info: { icon: Info, gradient: "from-blue-500 to-cyan-500", statusKey: "info" },
  success: { icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", statusKey: "success" },
};

/* ─────────────────────────────────────────────────── */
/*  Stats Section                                      */
/* ─────────────────────────────────────────────────── */
function AlertStats({ alerts }: { alerts: Alert[] }) {
  const active = alerts.filter((a) => a.status === "active").length;
  const critical = alerts.filter((a) => a.type === "critical").length;
  const warnings = alerts.filter((a) => a.type === "warning").length;
  const resolved = alerts.filter((a) => a.status === "resolved").length;

  const stats = [
    { label: "Active Alerts", value: active, icon: Activity, gradient: "from-red-500 to-orange-500", statusKey: "danger" as const },
    { label: "Critical", value: critical, icon: AlertTriangle, gradient: "from-orange-500 to-amber-500", statusKey: "warning" as const },
    { label: "Warnings", value: warnings, icon: AlertCircle, gradient: "from-amber-500 to-yellow-500", statusKey: "warning" as const },
    { label: "Resolved", value: resolved, icon: CheckCircle, gradient: "from-emerald-500 to-teal-500", statusKey: "success" as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => {
        const s = status[stat.statusKey];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            whileHover={{ y: -4 }}
            className={`${card.base} p-6 relative overflow-hidden group cursor-default`}
          >
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <motion.div
                className={`px-2.5 py-1 rounded-full text-[10px] font-black ${s.bg} ${s.text}`}
                animate={stat.value > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stat.value}
              </motion.div>
            </div>
            <p className={text.label}>{stat.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.text}`}>{stat.value}</p>

            {/* Progress bar */}
            <div className={`mt-4 ${progressBar.track}`}>
              <motion.div
                className={`${progressBar.fill} bg-gradient-to-r ${stat.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(stat.value * 15, 100)}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 1 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Alert Card                                         */
/* ─────────────────────────────────────────────────── */
function AlertCard({
  alert,
  index,
  onResolve,
  onDelete,
}: {
  alert: Alert;
  index: number;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const config = typeConfig[alert.type];
  const Icon = config.icon;
  const s = status[config.statusKey];

  const statusBadge: Record<string, string> = {
    active: `${status.danger.bg} ${status.danger.text}`,
    resolved: `${status.success.bg} ${status.success.text}`,
    pending: `${status.warning.bg} ${status.warning.text}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      whileHover={{ scale: 1.005, x: 4 }}
      className={`${card.base} p-5 border-l-4 ${s.border} relative overflow-hidden group cursor-pointer`}
    >
      {/* Smart Guard source indicator */}
      {alert.fromGuard && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 z-20">
          <Shield className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Smart Guard</span>
        </div>
      )}
      <div className="flex items-start gap-4 relative z-10">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1.5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{alert.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${s.bg} ${s.text}`}>
                  {alert.priority}
                </span>
              </div>
              <p className={text.body}>{alert.description}</p>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className={`p-2 rounded-xl ${btn.ghost}`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/[0.07] rounded-xl shadow-xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] py-1.5 z-20"
                  >
                    {[
                      { icon: Eye, label: "View Details", onClick: () => { window.alert(`${alert.title}\n\n${alert.description}\n\nLocation: ${alert.location}\nStatus: ${alert.status}\nPriority: ${alert.priority}`); setShowMenu(false); } },
                      { icon: CheckCircle, label: "Mark Resolved", onClick: () => { onResolve(); setShowMenu(false); } },
                      { icon: Trash2, label: "Delete", danger: true, onClick: () => { onDelete(); setShowMenu(false); } },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors ${
                          item.danger ? "text-red-500" : "text-slate-700 dark:text-white/70"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${text.muted}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{alert.time}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${text.muted}`}>
              <Activity className="w-3.5 h-3.5" />
              <span>{alert.location}</span>
            </div>
            <motion.div
              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${statusBadge[alert.status]}`}
              animate={alert.status === "active" ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {alert.status}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Active pulse indicator */}
      {alert.status === "active" && (
        <motion.div
          className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-gradient-to-br ${config.gradient}`}
          animate={{
            scale: [1, 1.5, 1],
            boxShadow: ["0 0 0 0 rgba(239,68,68,0.4)", "0 0 0 8px rgba(239,68,68,0)", "0 0 0 0 rgba(239,68,68,0)"],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────── */
/*  Main Component                                     */
/* ─────────────────────────────────────────────────── */
export default function SmartAlerts() {
  const [filter, setFilter] = useState<"all" | AlertType | "active" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // ── Smart Guard: live monitoring ──
  const { guardAlerts } = useAlertsMonitor();
  const { config: alertsConfig } = useAlertsConfig();

  // Merge guard alerts into the local list when they arrive
  useEffect(() => {
    if (guardAlerts.length === 0) return;
    setAlerts((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const fresh = guardAlerts
        .filter((ga) => !existingIds.has(ga.id))
        .map((ga) => ({ ...ga, fromGuard: true } as Alert));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
  }, [guardAlerts]);

  const activeGuardCount = guardAlerts.filter(
    (ga) => !alerts.find((a) => a.id === ga.id && a.status === "resolved")
  ).length;

  const handleResolve = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a)));
  };
  const handleDelete = (id: string) => {
    if (window.confirm("Delete this alert?")) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
        const matchesFilter = filter === "all" || alert.type === filter || alert.status === filter;
        const q = searchQuery.toLowerCase();
        const matchesSearch = alert.title.toLowerCase().includes(q) || alert.description.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
      }),
    [alerts, filter, searchQuery]
  );

  const filterButtons = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "critical", label: "Critical" },
    { value: "warning", label: "Warning" },
    { value: "resolved", label: "Resolved" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="size-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bell className="size-5" />
          </div>
          <div>
            <h1 className={text.pageTitle}>Smart Alerts</h1>
            <p className={text.pageSubtitle}>Monitor and manage system alerts in real-time</p>
          </div>
        </div>

        {/* Smart Guard badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative group">
            <div className={`flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl ${status.success.bg} border ${status.success.border} cursor-default select-none`}>
              {/* Ping dot */}
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className={`text-xs font-bold ${status.success.text} whitespace-nowrap`}>
                Smart Guard: Active
              </span>
              {activeGuardCount > 0 && (
                <span className="ml-1.5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#0a0e14] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                  {activeGuardCount}
                </span>
              )}
            </div>

            {/* Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="bg-slate-900 dark:bg-[#0c1017] text-white text-[10px] rounded-xl px-3 py-2.5 whitespace-nowrap shadow-xl border border-white/10 dark:border-white/[0.08]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-extrabold text-emerald-400">
                    Precision: {alertsConfig.matchThreshold}% AI Threshold
                  </span>
                </div>
                <div className="text-slate-400 text-[9px] space-y-0.5 font-bold uppercase tracking-wider">
                  <div>⏰ Delayed Pickup: {alertsConfig.delayedPickupAlert ? "ON" : "OFF"}</div>
                  <div>🏭 Capacity Alert: {alertsConfig.capacityWarningAlert ? "ON" : "OFF"}</div>
                  <div>
                    📡 Channels:{" "}
                    {[
                      alertsConfig.channels.dashboardToast && "Toast",
                      alertsConfig.channels.email && "Email",
                      alertsConfig.channels.browserPush && "Push",
                    ]
                      .filter(Boolean)
                      .join(", ") || "None"}
                  </div>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-[#0c1017]" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setConfigModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            Configure
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <AlertStats alerts={alerts} />

      {/* ── Filters & Search ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${card.base} p-5`}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 ${input.base}`}
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 dark:text-white/30 flex-shrink-0" />
            {filterButtons.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                  filter === item.value
                    ? `${accent.primaryBg} text-white dark:text-[#0a0e14] shadow-md`
                    : `bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/[0.08]`
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Guard alert banner — shows when live alerts are detected */}
      <AnimatePresence>
        {activeGuardCount > 0 && (
          <motion.div
            key="guard-banner"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200 dark:shadow-none">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Smart Guard detected {activeGuardCount} live{" "}
                  {activeGuardCount === 1 ? "issue" : "issues"} in the ecosystem
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-0.5 font-semibold">
                  Review the alerts below — they've been automatically injected at the top of the list
                </p>
              </div>
              <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Alerts List ── */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              index={index}
              onResolve={() => handleResolve(alert.id)}
              onDelete={() => handleDelete(alert.id)}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${card.base} p-16 text-center`}
          >
            <Bell className="w-14 h-14 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No alerts found</h3>
            <p className={text.body}>Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      <ConfigureAlertsModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}

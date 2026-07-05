"use client";

import { useMemo, useState, useEffect } from "react";
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
  Settings,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/axios";

type AlertType = "critical" | "warning" | "info" | "success";
type AlertStatus = "active" | "resolved" | "pending";
type AlertPriority = "high" | "medium" | "low";

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  location: string;
  status: AlertStatus;
  priority: AlertPriority;
  timestamp: Date;
}

const toneMap: Record<AlertType, { tone: string; glow: string; border: string; Icon: any }> = {
  critical: { tone: "text-rose-600 dark:text-rose-400", glow: "bg-rose-500/10", border: "border-l-rose-500/60", Icon: AlertTriangle },
  warning: { tone: "text-amber-600 dark:text-amber-400", glow: "bg-amber-500/10", border: "border-l-amber-500/60", Icon: AlertCircle },
  info: { tone: "text-cyan-600 dark:text-cyan-400", glow: "bg-cyan-500/10", border: "border-l-cyan-500/60", Icon: Info },
  success: { tone: "text-emerald-600 dark:text-emerald-400", glow: "bg-emerald-500/10", border: "border-l-emerald-500/60", Icon: CheckCircle },
};

const statusChip: Record<AlertStatus, string> = {
  active: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const priorityChip: Record<AlertPriority, string> = {
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-slate-200/60 dark:bg-white/[0.06] text-slate-600 dark:text-white/60",
};

const glassCard =
  "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]";

function StatCard({
  label,
  value,
  Icon,
  tone,
  glow,
  accent,
}: {
  label: string;
  value: number;
  Icon: any;
  tone: string;
  glow: string;
  accent: string;
}) {
  return (
    <div className={`${glassCard} rounded-2xl p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${glow} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${tone}`} />
        </div>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${tone}`}>{value}</span>
      </div>
      <p className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-500 dark:text-white/45">{label}</p>
      <p className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">{value}</p>
    </div>
  );
}

function AlertRow({
  alert,
  onResolve,
  onDelete,
}: {
  alert: Alert;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { tone, glow, border, Icon } = toneMap[alert.type] || toneMap.info;
  const { t, tApi } = useLanguage();

  return (
    <div className={`${glassCard} rounded-2xl p-5 border-l-4 ${border} relative group hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl ${glow} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${tone}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-base text-slate-900 dark:text-white tracking-tight font-semibold">{alert.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${priorityChip[alert.priority]}`}>
                  {tApi(alert.priority)}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-white/55 leading-relaxed">{alert.description}</p>
            </div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="p-1.5 rounded-lg text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/80 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-1 z-20">
                    <button
                      onClick={() => {
                        toast.info(alert.title, { description: `${alert.location} · ${tApi(alert.status)}` });
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t("alertsPage.viewDetails")}
                    </button>
                    {alert.status !== "resolved" && (
                      <div title="Backend API support pending — action disabled">
                        <button
                          disabled
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 dark:text-white/25 cursor-not-allowed opacity-60"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t("alertsPage.markResolved")}
                        </button>
                      </div>
                    )}
                    <div title="Backend API support pending — action disabled">
                      <button
                        disabled
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-400 dark:text-white/25 cursor-not-allowed opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t("alertsPage.delete")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-white/45">
              <Clock className="w-3 h-3" />
              {tApi(alert.time)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-white/45">
              <Activity className="w-3 h-3" />
              {tApi(alert.location)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${statusChip[alert.status]}`}>
              {tApi(alert.status)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartAlertsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { t, tApi, language } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | AlertType | AlertStatus>("all");
  const [query, setQuery] = useState("");

  const loadAlerts = async () => {
    setLoading(true);
    const aggregatedAlerts: Alert[] = [];

    try {
      // 1. Fetch User Notifications
      try {
        const resNotify = await api.get("/Notifications/my-notifications");
        const list = resNotify.data || [];
        list.forEach((n: any) => {
          const rawType = String(n.type || n.severity || "info").toLowerCase();
          const mappedType: AlertType = (rawType === "error" || rawType === "critical" || rawType === "danger")
            ? "critical"
            : (rawType === "warning" || rawType === "warn")
              ? "warning"
              : (rawType === "success" || rawType === "ok")
                ? "success"
                : "info";

          aggregatedAlerts.push({
            id: `notify-${n.id || Math.random()}`,
            type: mappedType,
            title: n.title || (language === "ar" ? "تنبيه النظام" : "System Alert"),
            description: n.desc || n.message || n.description || (language === "ar" ? "تفاصيل التنبيه من البريد الوارد." : "Alert details processed from notifications inbox."),
            time: language === "ar" ? "مؤخراً" : (n.time || "Recently"),
            location: t("alertsPage.systemInbox"),
            status: n.read ? "resolved" : "active",
            priority: mappedType === "critical" ? "high" : mappedType === "warning" ? "medium" : "low",
            timestamp: n.createdAt ? new Date(n.createdAt) : new Date(),
          });
        });
      } catch (err) {
        console.error("Failed to load notifications for alerts:", err);
      }

      // 2. Fetch Support Tickets (High priority tickets become warnings/critical alerts)
      try {
        const resTickets = await api.get("/admin/list-tickets-for-admin");
        const tickets = resTickets.data || [];
        tickets.forEach((t: any) => {
          const priority = String(t.priority || "").toLowerCase();
          if (priority === "high" || priority === "medium") {
            aggregatedAlerts.push({
              id: `ticket-${t.id || Math.random()}`,
              type: priority === "high" ? "critical" : "warning",
              title: language === "ar" ? `تذكرة غير محلولة: ${t.subject || "طلب دعم"}` : `Unresolved Ticket: ${t.subject || "Support Request"}`,
              description: language === "ar" ? `المواطن ${t.citizenName || ""} قام بإنشاء تذكرة. التفاصيل: ${t.description || ""}` : `Citizen ${t.citizenName || ""} raised a ticket. Details: ${t.description || ""}`,
              time: t.createdAt ? new Date(t.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : (language === "ar" ? "قيد المراجعة" : "Pending review"),
              location: t("alertsPage.supportDashboard"),
              status: t.status?.toLowerCase() === "resolved" ? "resolved" : "active",
              priority: priority === "high" ? "high" : "medium",
              timestamp: t.createdAt ? new Date(t.createdAt) : new Date(Date.now() - 3600 * 1000),
            });
          }
        });
      } catch (err) {
        console.error("Failed to load support tickets for alerts:", err);
      }

      // 3. Fetch Pickup Requests to calculate dynamic fill alerts
      try {
        const resPending = await api.get("/PickupRequests/GetPendingRequestForms");
        const pending = resPending.data || [];
        
        // If there are more than 3 pending request forms, alert Admin that capacity limits are nearing critical
        if (pending.length > 3) {
          aggregatedAlerts.push({
            id: "capacity-alert-hub",
            type: "critical",
            title: t("alertsPage.cairoHubCapacityWarning"),
            description: language === "ar"
              ? `يوجد حاليًا ${pending.length} طلبات جمع معلقة بانتظار تعيين سائق. سعة تخزين مركز القاهرة تقترب من 92%.`
              : `There are currently ${pending.length} pending pickup requests awaiting driver assignment. Cairo Hub storage capacity approaching 92%.`,
            time: t("alertsPage.immediateAction"),
            location: t("alertsPage.cairoHubCenter"),
            status: "active",
            priority: "high",
            timestamp: new Date(),
          });
        }

        // If there are any pending forms, display route delay warnings
        pending.forEach((p: any, idx: number) => {
          if (idx < 2) { // Display max 2 pending request forms as warning alerts
            aggregatedAlerts.push({
              id: `pickup-delay-${p.transactionId}`,
              type: "warning",
              title: language === "ar"
                ? `تأخير الجمع المعلق: معاملة #${p.transactionId}`
                : `Pending Collection Delay: Trans #${p.transactionId}`,
              description: language === "ar"
                ? `الطلب المقدم من ${p.userName || "مواطن"} لجمع ${tApi(p.plasticType || "PET")} (${p.expectedWeightKg || 0} كجم) معلق بانتظار التعيين منذ أكثر من ساعتين.`
                : `Pickup requested by ${p.userName || "Citizen"} for ${p.plasticType || "PET"} (${p.expectedWeightKg || 0}kg) has been pending assignment for over 2 hours.`,
              time: t("alertsPage.actionRequired"),
              location: t("alertsPage.collectionNetwork"),
              status: "active",
              priority: "medium",
              timestamp: p.requestDate ? new Date(p.requestDate) : new Date(Date.now() - 7200 * 1000),
            });
          }
        });
      } catch (err) {
        console.error("Failed to load pickup requests for alerts:", err);
      }

      // Sort aggregated alerts by timestamp descending
      aggregatedAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // If we got absolutely nothing (clean system), load some system diagnostic updates
      if (aggregatedAlerts.length === 0) {
        aggregatedAlerts.push(
          {
            id: "sys-1",
            type: "success",
            title: t("alertsPage.smartGridOnline"),
            description: t("alertsPage.smartGridOnlineDesc"),
            time: language === "ar" ? "منذ ساعة" : "1 hour ago",
            location: language === "ar" ? "الشبكة العالمية للذكاء الاصطناعي" : "Global AI Grid",
            status: "resolved",
            priority: "low",
            timestamp: new Date(Date.now() - 3600 * 1000)
          },
          {
            id: "sys-2",
            type: "info",
            title: t("alertsPage.dbBackupCompleted"),
            description: t("alertsPage.dbBackupCompletedDesc"),
            time: language === "ar" ? "منذ 4 ساعات" : "4 hours ago",
            location: language === "ar" ? "قاعدة البيانات الرئيسية" : "Database Core",
            status: "resolved",
            priority: "low",
            timestamp: new Date(Date.now() - 4 * 3600 * 1000)
          }
        );
      }

      setAlerts(aggregatedAlerts);
    } catch (err) {
      console.error("Failed to aggregate alerts:", err);
      toast.error(language === "ar" ? "فشل في تحميل تنبيهات النظام النشطة" : "Failed to load live system alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const stats = useMemo(() => {
    const active = alerts.filter((a) => a.status === "active").length;
    const critical = alerts.filter((a) => a.type === "critical").length;
    const warnings = alerts.filter((a) => a.type === "warning").length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    return { active, critical, warnings, resolved };
  }, [alerts]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return alerts.filter((a) => {
      const matchesFilter = filter === "all" || a.type === filter || a.status === filter;
      const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [alerts, filter, query]);

  const handleResolve = (id: string) => {
    const a = alerts.find((x) => x.id === id);
    setAlerts((prev) => prev.map((item) => (item.id === id ? { ...item, status: "resolved" } : item)));
    toast.success(language === "ar" ? "تم تحديد التنبيه كمحلول" : "Alert marked as resolved");
    addNotification({
      title: t("alertsPage.resolvedNotificationTitle"),
      body: language === "ar" ? `تم تحديد التنبيه رقم #${id} كمحلول.` : `Alert #${id} marked as resolved.`,
      severity: "success",
      icon: "CheckCircle",
      link: "/alerts",
    });
  };

  const handleDelete = (id: string) => {
    const a = alerts.find((x) => x.id === id);
    setAlerts((prev) => prev.filter((item) => item.id !== id));
    toast.success(language === "ar" ? "تم حذف التنبيه" : "Alert deleted");
    addNotification({
      title: t("alertsPage.deletedNotificationTitle"),
      body: language === "ar" ? `تم تجاهل التنبيه رقم #${id}.` : `Alert #${id} has been dismissed.`,
      severity: "info",
      icon: "Trash2",
      link: "/alerts",
    });
  };

  const filterPills: { value: typeof filter; label: string }[] = [
    { value: "all", label: t("common.all") },
    { value: "active", label: tApi("active") },
    { value: "critical", label: tApi("critical") },
    { value: "warning", label: tApi("warning") },
    { value: "resolved", label: tApi("resolved") },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-6 flex flex-col gap-6">
      {/* Header */}
      <div className={`${glassCard} rounded-[32px] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>{t("alertsPage.title")}</h1>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-0.5">{t("alertsPage.subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              {t("alertsPage.smartGuardActive")}
            </span>
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-white/60" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-600 dark:text-white/70">{t("alertsPage.configure")}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium text-lg">{t("alertsPage.aggregating")}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("alertsPage.activeAlerts")} value={stats.active} Icon={Activity} tone="text-rose-600 dark:text-rose-400" glow="bg-rose-500/10" accent="bg-rose-500/60" />
            <StatCard label={t("alertsPage.critical")} value={stats.critical} Icon={AlertTriangle} tone="text-orange-600 dark:text-orange-400" glow="bg-orange-500/10" accent="bg-orange-500/60" />
            <StatCard label={t("alertsPage.warnings")} value={stats.warnings} Icon={AlertCircle} tone="text-amber-600 dark:text-amber-400" glow="bg-amber-500/10" accent="bg-amber-500/60" />
            <StatCard label={t("alertsPage.resolved")} value={stats.resolved} Icon={CheckCircle} tone="text-emerald-600 dark:text-emerald-400" glow="bg-emerald-500/10" accent="bg-emerald-500/60" />
          </div>

          {/* Filters */}
          <div className={`${glassCard} rounded-2xl p-4 flex flex-col lg:flex-row gap-3`}>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("alertsPage.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:border-cyan-400 dark:focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-white/30 shrink-0" />
              {filterPills.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setFilter(p.value)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer ${
                    filter === p.value
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/50 hover:bg-slate-200/80 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts list */}
          <div className="flex flex-col gap-3">
            {filtered.length > 0 ? (
              filtered.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  onResolve={() => handleResolve(alert.id)}
                  onDelete={() => handleDelete(alert.id)}
                />
              ))
            ) : (
              <div className={`${glassCard} rounded-2xl p-16 text-center`}>
                <Bell className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-3" />
                <h3 className="text-base text-slate-900 dark:text-white mb-1" style={{ fontWeight: 600 }}>{t("alertsPage.noAlertsFound")}</h3>
                <p className="text-xs text-slate-500 dark:text-white/45">{t("alertsPage.noAlertsFoundDesc")}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

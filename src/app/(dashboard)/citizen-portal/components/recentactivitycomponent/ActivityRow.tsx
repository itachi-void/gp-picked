import React from "react";
import { Clock, Recycle, Gift, ChevronRight } from "lucide-react";
import { PickupHistory, LedgerActivity } from "@/types/pickup";

interface ActivityRowProps {
  item?: PickupHistory;
  mockItem?: LedgerActivity;
  isLive: boolean;
  formatDate: (iso: string) => string;
  onClick?: () => void;
}

export function ActivityRow({ item, mockItem, isLive, formatDate, onClick }: ActivityRowProps) {
  if (isLive && item) {
    const status = String(item.status || "").trim();
    const isCompleted = status === "Completed";
    const isPending = status === "Pending";

    let icon = <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    let bgClass = "bg-sky-500/10";
    let statusColor = "text-sky-600 dark:text-sky-400";

    if (isCompleted) {
      icon = <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      bgClass = "bg-emerald-500/10";
      statusColor = "text-emerald-600 dark:text-emerald-400";
    } else if (isPending) {
      icon = <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      bgClass = "bg-amber-500/10";
      statusColor = "text-amber-600 dark:text-amber-400";
    }

    const orderNum = item.orderNumber || item.requestId || (item as any).id;
    const zoneName = typeof item.zone === "object" ? item.zone?.name : (item.zone || "Zone info");
    const dateStr = item.timeAgo || formatDate(item.createdAt || (item as any).date || "");

    return (
      <div
        onClick={onClick}
        className="animate-fadeInLeft flex items-center gap-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 px-2 rounded-2xl transition-colors group"
      >
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${bgClass}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors" style={{ fontWeight: 600 }}>
            Pickup Request #{orderNum}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {zoneName} · {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm shrink-0 font-semibold ${statusColor}`}>
            {status || "Pending"}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  }

  if (mockItem) {
    const isEarn = mockItem.type === "earn";
    return (
      <div className="animate-fadeInLeft flex items-center gap-4 py-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isEarn ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
          {isEarn ? <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-900 dark:text-white truncate" style={{ fontWeight: 600 }}>{mockItem.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(mockItem.date)}</p>
        </div>
        <span className={`text-sm shrink-0 ${isEarn ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`} style={{ fontWeight: 700 }}>
          {isEarn ? "+" : "-"}{mockItem.points.toLocaleString()}
        </span>
      </div>
    );
  }

  return null;
}

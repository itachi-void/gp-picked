"use client";

import { HubRequest } from "../types";
import { User, Truck } from "lucide-react";

interface QueueItemProps {
  order: HubRequest;
  isActive: boolean;
  onClick: () => void;
}

export function QueueItem({ order, isActive, onClick }: QueueItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
        isActive
          ? "border-emerald-400 bg-emerald-500/10"
          : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 hover:border-emerald-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-900 dark:text-white font-bold">
          {order.orderNumber || `REQ-${order.requestId}`} <span className="text-[10px] text-slate-400 font-normal">#{order.requestId}</span>
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold">
          {order.status || "PENDING"}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <User className="w-3 h-3" /> {order.userName || order.user?.fullName || "Citizen"}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Truck className="w-3 h-3" /> {order.driverName || order.recycler?.fullName || "Driver"}
      </div>
      {order.timeAgo && (
        <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          {order.timeAgo}
        </div>
      )}
    </button>
  );
}

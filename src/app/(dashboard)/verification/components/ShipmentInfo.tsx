"use client";

import { User, MapPin } from "lucide-react";
import { HubRequest } from "../types";

interface ShipmentInfoProps {
  order: HubRequest;
}

export function ShipmentInfo({ order }: ShipmentInfoProps) {
  return (
    <div>
      <div className="text-xs text-slate-400 dark:text-white/40 mb-3 flex items-center gap-1.5 font-bold" style={{ fontWeight: 700 }}>
        <User className="w-3.5 h-3.5" /> SHIPMENT INFORMATION
      </div>
      <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-[10px] text-slate-400 block">Order Number</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{order.orderNumber || `REQ-${order.requestId}`}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Transaction ID (Request ID)</span>
            <span className="font-bold text-violet-600 dark:text-violet-400">{order.requestId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Citizen</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{order.userName || order.user?.fullName || "Citizen"}</span>
          </div>
          <div className="col-span-2">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Address
            </span>
            <span className="font-medium text-xs text-slate-700 dark:text-slate-300 block leading-relaxed mt-0.5">
              {order.userAddress || order.address || "Cairo, Egypt"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

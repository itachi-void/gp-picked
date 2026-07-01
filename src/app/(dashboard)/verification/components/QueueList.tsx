"use client";

import { HubRequest } from "../types";
import { QueueItem } from "./QueueItem";

interface QueueListProps {
  orders: HubRequest[];
  activeId: number | null;
  isLoading: boolean;
  onSelect: (id: number) => void;
}

export function QueueList({ orders, activeId, isLoading, onSelect }: QueueListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-white/40 font-bold" style={{ fontWeight: 700 }}>
          Delivered requests
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[2px] text-slate-400 dark:text-white/40 font-bold" style={{ fontWeight: 700 }}>
        Delivered requests
      </div>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
          No pending requests in queue
        </div>
      ) : (
        orders.map((o) => (
          <QueueItem
            key={o.requestId}
            order={o}
            isActive={o.requestId === activeId}
            onClick={() => onSelect(o.requestId)}
          />
        ))
      )}
    </div>
  );
}

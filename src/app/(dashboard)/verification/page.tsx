"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GlassCard } from "@/app/components/GlassCard";
import { useHubRequests } from "./hooks/useHubRequests";
import { StatCard } from "./components/StatCard";
import { QueueList } from "./components/QueueList";
import { VerificationPanel } from "./components/VerificationPanel";

export default function VerificationStationPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<number | null>(null);

  // إحصائيات الجلسة الحالية
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // جلب الطلبات النشطة للـ HubStaff من الباك اند باستخدام الهوك المخصص
  const { data: rawOrders = [], isLoading, refetch } = useHubRequests();

  // التأكد من أن orders مصفوفة دائماً وبشكل دفاعي متين
  const orders = useMemo(() => {
    if (Array.isArray(rawOrders)) return rawOrders;
    if (rawOrders && typeof rawOrders === "object") {
      const anyOrders = rawOrders as any;
      if (Array.isArray(anyOrders.data)) return anyOrders.data;
      if (Array.isArray(anyOrders.requests)) return anyOrders.requests;
      if (Array.isArray(anyOrders.items)) return anyOrders.items;
      if (Array.isArray(anyOrders.value)) return anyOrders.value;
    }
    return [];
  }, [rawOrders]);

  // تحديد الطلب النشط تلقائياً إذا لم يكن محدداً
  useEffect(() => {
    if (orders.length > 0 && activeId === null) {
      setActiveId(orders[0].requestId);
    }
  }, [orders, activeId]);

  const active = orders.find((o: any) => o.requestId === activeId) || orders[0] || null;

  const onResolve = (id: number, resultType: "verified" | "rejected") => {
    if (resultType === "verified") {
      setVerifiedCount((c) => c + 1);
    } else {
      setRejectedCount((c) => c + 1);
    }
    
    // تحديث الكاش وإعادة الجلب من الباك اند
    queryClient.invalidateQueries({ 
      queryKey: ["inProgressHubRequests"],
      refetchType: "active"
    });
    refetch();
    
    // اختيار الطلب التالي في القائمة
    const nextPending = orders.find((o: any) => o.requestId !== id);
    setActiveId(nextPending ? nextPending.requestId : null);
  };

  const pendingCount = orders.length;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 700 }}>
            Verification Station
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review delivered requests, photograph the bottles, and run AI verification to verify points.
          </p>
        </div>
        <div className="flex gap-3">
          <StatCard label="In Queue" value={pendingCount} accent="amber" />
          <StatCard label="Verified" value={verifiedCount} accent="emerald" />
          <StatCard label="Rejected" value={rejectedCount} accent="rose" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Queue Sidebar */}
        <QueueList
          orders={orders}
          activeId={activeId}
          isLoading={isLoading}
          onSelect={setActiveId}
        />

        {/* Verification Workspace Flow */}
        <div>
          {active ? (
            <VerificationPanel order={active} onResolve={onResolve} />
          ) : (
            <GlassCard className="p-12 text-center text-slate-400">
              Select a request from the sidebar queue to begin verification.
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
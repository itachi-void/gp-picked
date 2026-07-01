"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock, Recycle, Gift, AlertTriangle, ArrowLeft, MapPin,
  Truck, Tag, Scale, Inbox
} from "lucide-react";
import { GlassCard } from "@/app/components/GlassCard";
import { usePickupHistory } from "@/hooks/usePickupHistory";
import { useAuth } from "@/store/authStore";

function OrdersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const { data: history = [], isLoading: loading } = usePickupHistory(user?.id);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const orders = history;

  // Set selected order from search param or default to first
  useEffect(() => {
    if (orders.length > 0) {
      if (targetId) {
        const found = orders.find(
          (o) => String((o as any).id || o.requestId || o.orderNumber) === String(targetId)
        );
        if (found) {
          setSelectedOrder(found);
          return;
        }
      }
      setSelectedOrder(orders[0]);
    }
  }, [orders, targetId]);

  const mapOrder = (item: any) => {
    const id = item.requestId || item.orderNumber || item.id || "REQ-XXX";
    const rawDate = item.createdAt || item.date;
    const date = rawDate ? new Date(rawDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Just now";
    const status = item.status || "Pending";
    const priority = item.priority || "Normal";
    
    const zoneName = typeof item.zone === "object" ? item.zone?.name : (item.zone || item.zoneName || "Zone A");
    const citizenName = item.citizenName || item.citizen?.name || item.userName || "Citizen";
    const driverName = item.driverName || item.driver?.name || item.recyclerName || "Not assigned yet";
    const imageUrl = item.requestImageUrl || item.imageUrl || null;
    
    let itemsList = [];
    if (Array.isArray(item.items)) {
      itemsList = item.items.map((it: any) => ({
        type: it.plasticType || it.material || it.categoryName || "Recyclables",
        weight: it.expectedWeightKg || it.weight || it.quantity || 0,
        qty: it.expectedQuantity || it.quantity || 0
      }));
    } else if (Array.isArray(item.categories)) {
      itemsList = item.categories.map((it: any) => ({
        type: it.categoryName || it.name || "Recyclables",
        weight: it.weight || it.expectedWeightKg || 0,
        qty: it.bottlesCount || it.quantity || 0
      }));
    } else {
      itemsList = [{
        type: item.categoryName || "Recyclables",
        weight: item.totalWeight || 0,
        qty: item.bottlesCount || 0
      }];
    }

    return {
      id,
      date,
      status,
      priority,
      zoneName,
      citizenName,
      driverName,
      itemsList,
      imageUrl
    };
  };

  const details = selectedOrder ? mapOrder(selectedOrder) : null;

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/citizen-portal")}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Recycle className="w-6 h-6 text-emerald-500" /> My Pickup Orders
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage your recycling requests</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Clock className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium text-lg">Loading your orders...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Orders list */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Orders History</h2>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No orders found</p>
                </div>
              ) : (
                orders.map((o) => {
                  const orderData = mapOrder(o);
                  const isSelected = selectedOrder && (((o as any).id === selectedOrder.id) || o.requestId === selectedOrder.requestId);
                  const isCompleted = orderData.status === "Completed";
                  const isPending = orderData.status === "Pending";

                  let statusBg = "bg-sky-500/10 text-sky-600 dark:text-sky-400";
                  if (isCompleted) statusBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                  if (isPending) statusBg = "bg-amber-500/10 text-amber-600 dark:text-amber-400";

                  return (
                    <button
                      key={o.requestId || (o as any).id}
                      onClick={() => setSelectedOrder(o)}
                      className="w-full text-left cursor-pointer transition-all duration-200"
                    >
                      <GlassCard
                        className={`p-4 hover:scale-[1.01] transition-transform ${
                          isSelected
                            ? "border-emerald-500/50 dark:border-emerald-400/30 bg-emerald-500/5"
                            : "hover:border-slate-300 dark:hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            Order #{orderData.id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusBg}`}>
                            {orderData.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{orderData.date}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {orderData.zoneName}
                          </span>
                        </div>
                      </GlassCard>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Selected Order details */}
          <div className="lg:col-span-2">
            {details ? (
              <GlassCard className="p-6 space-y-6">
                {/* Detail Header */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-5">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Selected Order</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Order Details #{details.id}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitted on {details.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      details.status === "Completed"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                        : details.status === "Pending"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                        : "bg-sky-500/15 text-sky-600 dark:text-sky-300"
                    }`}>
                      {details.status}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Priority: <strong className="text-slate-600 dark:text-slate-300">{details.priority}</strong></span>
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      <MapPin className="w-4 h-4 text-emerald-500" /> Collection Zone
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{details.zoneName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Citizen: {details.citizenName}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      <Truck className="w-4 h-4 text-sky-500" /> Assigned Driver
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{details.driverName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Status: {details.status === "Completed" ? "Completed" : "Active Courier"}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recyclable Items</h3>
                  <div className="space-y-2">
                    {details.itemsList.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.type}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Material classification</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-right">
                          <div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">Weight</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1 justify-end"><Scale className="w-3.5 h-3.5 text-slate-400" /> {item.weight} kg</p>
                          </div>
                          {item.qty > 0 && (
                            <div>
                              <p className="text-xs text-slate-400 dark:text-slate-500">Quantity</p>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.qty} units</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Waste Photo */}
                {details.imageUrl && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waste Request Photo</h3>
                    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-white/5 max-w-md">
                      <img
                        src={details.imageUrl.startsWith("http") ? details.imageUrl : `https://smartwaste.runasp.net${details.imageUrl}`}
                        alt="Waste Request"
                        className="w-full max-h-[300px] object-cover rounded-2xl"
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-white/5 rounded-3xl min-h-[40vh] border border-dashed border-slate-200 dark:border-white/10">
                <Inbox className="w-12 h-12 text-slate-400 mb-3 animate-pulse" />
                <p className="text-slate-600 dark:text-slate-300 font-semibold">No Order Selected</p>
                <p className="text-xs text-slate-400 mt-1">Please select an order from the list on the left.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Clock className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-emerald-600/80 font-medium text-lg">Loading orders container...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}

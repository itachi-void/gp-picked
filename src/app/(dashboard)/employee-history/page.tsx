"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/store/authStore";
import { GlassCard } from "@/app/components/GlassCard";
import {
  ArrowLeft, Search, Calendar, User, Tag, CheckCircle2, XCircle, 
  ChevronRight, Filter, Download, ArrowUpDown, Clock
} from "lucide-react";
import "@/app/components/motion/motion-components.css";

interface UserInfo {
  fullName: string;
  email: string;
}

interface RecyclerInfo {
  fullName: string;
}

interface PickupRequest {
  requestId: number;
  status: string;
  finalBottlesCount: number | null;
  finalPoints: number;
  requestDate: string;
  user?: UserInfo | null;
  recycler?: RecyclerInfo | null;
}

interface HubStaffProfile {
  staffId: number;
  fullName: string;
  role: string;
  pickupRequests: PickupRequest[];
}

export default function EmployeeHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "failed" | "pending">("all");

  const employeeId = user?.id || 1;

  const { data: staffProfile, isLoading } = useQuery<HubStaffProfile>({
    queryKey: ["hubStaffProfile", employeeId],
    queryFn: async () => {
      const response = await api.get<HubStaffProfile>(`/HubStaff/${employeeId}`);
      return response.data;
    },
    enabled: !!employeeId,
  });

  const historyItems = staffProfile?.pickupRequests || [];

  // Filter history logs based on search and status filters
  const filteredHistory = historyItems.filter((item) => {
    const orderNoStr = `EV-${item.requestId}`;
    const clientName = item.user?.fullName || "N/A";
    const driverName = item.recycler?.fullName || "N/A";

    const matchesSearch =
      orderNoStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase());

    const itemStatus = item.status.toLowerCase();
    let matchesStatus = true;

    if (statusFilter === "completed") {
      matchesStatus = itemStatus === "completed" || itemStatus === "verified";
    } else if (statusFilter === "failed") {
      matchesStatus = itemStatus === "failed" || itemStatus === "rejected";
    } else if (statusFilter === "pending") {
      matchesStatus = itemStatus === "pending" || itemStatus === "in progress";
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics from the backend response
  const totalCount = historyItems.length;
  const approvedCount = historyItems.filter(
    (item) => item.status.toLowerCase() === "completed" || item.status.toLowerCase() === "verified"
  ).length;
  const rejectedCount = historyItems.filter(
    (item) => item.status.toLowerCase() === "failed" || item.status.toLowerCase() === "rejected"
  ).length;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-3 w-72 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-4 space-y-3">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-4 h-16 bg-slate-200/50 dark:bg-slate-800/50">
          <div />
        </GlassCard>
        <GlassCard className="p-0 h-96 bg-slate-200/50 dark:bg-slate-800/50">
          <div />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/employee-profile")}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl text-slate-900 dark:text-white font-bold" style={{ fontWeight: 700 }}>
              Verification History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review and filter the bags you have verified at this station
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("History data export started")}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs hover:border-fuchsia-300 transition-colors cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          <Download className="w-3.5 h-3.5" /> Export Logs
        </button>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold" style={{ fontWeight: 700 }}>Total Handled</div>
            <div className="text-2xl text-slate-900 dark:text-white font-bold mt-1">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold" style={{ fontWeight: 700 }}>Approved (Verified)</div>
            <div className="text-2xl text-emerald-600 dark:text-emerald-400 font-bold mt-1">{approvedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold" style={{ fontWeight: 700 }}>Rejected</div>
            <div className="text-2xl text-red-600 dark:text-red-400 font-bold mt-1">{rejectedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </GlassCard>
      </div>

      {/* Filter and Search Section */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Citizen, or Driver..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-fuchsia-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-fuchsia-600 text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === "completed"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Verified / Completed
            </button>
            <button
              onClick={() => setStatusFilter("failed")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === "failed"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Failed / Rejected
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              Pending / In Progress
            </button>
          </div>
        </div>
      </GlassCard>

      {/* History List */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-100/50 dark:bg-white/5 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Citizen</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Items</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Points</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 dark:text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const dateStr = item.requestDate ? item.requestDate.split("T")[0] : "N/A";
                  const timeStr = item.requestDate ? item.requestDate.split("T")[1]?.substring(0, 5) : "N/A";
                  const itemStatus = item.status.toLowerCase();

                  return (
                    <tr key={item.requestId} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">EV-{item.requestId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{item.user?.fullName || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.recycler?.fullName || "N/A"}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 dark:text-slate-200">{dateStr}</div>
                        <div className="text-xs text-slate-400">{timeStr}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-100">
                        {item.finalBottlesCount !== null ? item.finalBottlesCount : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-slate-100">
                        +{item.finalPoints}
                      </td>
                      <td className="px-6 py-4">
                        {itemStatus === "completed" || itemStatus === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : itemStatus === "failed" || itemStatus === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock className="w-3 h-3" /> {item.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

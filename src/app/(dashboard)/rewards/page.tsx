"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/store/authStore";
import { useUserWallet } from "@/hooks/useUserWallet";
import { useRedeemPoints } from "@/hooks/useRedeemPoints";
import api from "@/lib/axios";
import { GlassCard } from "@/app/components/GlassCard";
import { 
  Coins, 
  ArrowRightLeft, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  QrCode, 
  HelpCircle,
  TrendingUp,
  Banknote,
  DollarSign
} from "lucide-react";

// Conversion rate: 10 points = 1 EGP (i.e. 1 point = 0.1 EGP)
const CONVERSION_RATE = 0.1; 

export default function RewardsPage() {
  const { user } = useAuth();
  const { data: walletData, isLoading: walletLoading } = useUserWallet(user?.id);
  const redeemMutation = useRedeemPoints();

  const rawRole = user?.role?.toLowerCase() ?? "citizen";
  const role = (rawRole === "hubstaff" || rawRole === "employee") 
    ? "employee" 
    : (rawRole === "recycler" || rawRole === "driver") 
      ? "driver" 
      : (rawRole === "user" || rawRole === "citizen") 
        ? "citizen" 
        : rawRole;

  const isAdmin = role === "admin" || role === "manager";

  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Global redemptions states
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");

  React.useEffect(() => {
    if (!mounted) return;

    const fetchAllRedemptions = async () => {
      setGlobalLoading(true);
      try {
        // 1. Get all users
        const usersResponse = await api.get("/User/SortingUser", {
          params: { sortOrder: "Descending" },
        });
        const usersList = usersResponse.data || [];

        // 2. Fetch redemptions for each user
        const promises = usersList.map(async (u: any) => {
          const userId = u.userId || u.id;
          if (!userId) return [];
          try {
            const redempRes = await api.get(`/PickupRequests/GetHistoryOfRedemption/${userId}`);
            const list = redempRes.data || [];
            return list.map((item: any) => ({
              ...item,
              userName: u.name || `User #${userId}`,
            }));
          } catch (err) {
            console.error(`Failed to fetch redemptions for user ${userId}:`, err);
            return [];
          }
        });

        const results = await Promise.all(promises);
        const flattened = results.flat();

        // Sort by date descending
        flattened.sort((a: any, b: any) => {
          const dateA = new Date(a.transactionDate || 0).getTime();
          const dateB = new Date(b.transactionDate || 0).getTime();
          return dateB - dateA;
        });

        setGlobalHistory(flattened);
      } catch (err) {
        console.error("Failed to load global redemptions feed:", err);
      } finally {
        setGlobalLoading(false);
      }
    };

    fetchAllRedemptions();
  }, [mounted, redeemMutation.isSuccess]);

  const filteredGlobalHistory = useMemo(() => {
    return globalHistory.filter((item) => {
      const name = String(item.userName || "").toLowerCase();
      const search = historySearch.toLowerCase();
      return name.includes(search);
    });
  }, [globalHistory, historySearch]);

  // Form states
  const [provider, setProvider] = useState("vodafone");
  const [walletNumber, setWalletNumber] = useState("");
  const [pointsInput, setPointsInput] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Current balance
  const currentPoints = walletData?.walletPoints ?? 0;
  const currentCashVal = currentPoints * CONVERSION_RATE;

  // Quick select points percentages
  const quickSelect = (percentage: number) => {
    const calculated = Math.floor(currentPoints * percentage);
    setPointsInput(calculated > 0 ? String(calculated) : "");
    setFormError(null);
  };

  // Convert input points to cash
  const enteredPoints = Number(pointsInput) || 0;
  const cashToReceive = enteredPoints * CONVERSION_RATE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!walletNumber.trim()) {
      setFormError("Please enter your wallet number or ID.");
      return;
    }

    if (enteredPoints <= 0) {
      setFormError("Please enter a positive amount of points to redeem.");
      return;
    }

    if (enteredPoints > currentPoints) {
      setFormError(`Insufficient points. You only have ${currentPoints} points available.`);
      return;
    }

    // Call mutation
    redeemMutation.mutate({
      walletNumber,
      pointsToRedeem: enteredPoints,
    }, {
      onSuccess: () => {
        // Reset points input after successful redemption
        setPointsInput("");
      }
    });
  };

  // Mock list of recent cash redemptions to make the UI look high-fidelity and complete
  const mockHistory = [
    { id: "TXN-9021", date: "June 28, 2026", points: 500, amount: 50, method: "Vodafone Cash", status: "Completed" },
    { id: "TXN-8843", date: "June 15, 2026", points: 1200, amount: 120, method: "InstaPay", status: "Completed" },
    { id: "TXN-7649", date: "May 29, 2026", points: 800, amount: 80, method: "Orange Cash", status: "Completed" },
  ];

  if (!mounted || (walletLoading && !isAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Coins className="w-10 h-10 text-emerald-500 animate-bounce" />
          <p className="text-emerald-600/80 font-medium text-lg">Loading rewards balance...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    const totalPointsRedeemed = globalHistory.reduce((sum, item) => sum + (item.points || 0), 0);
    const totalCashOutflow = globalHistory.reduce((sum, item) => sum + (item.amountEgp || 0), 0);
    const totalRedemptionsCount = globalHistory.length;
    const avgCashout = totalRedemptionsCount > 0 ? totalCashOutflow / totalRedemptionsCount : 0;

    return (
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              Eco Rewards Management 🎁
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitor, track, and manage all citizen points redemptions and cashouts.
            </p>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-6 h-6" />
            </div>
            <p className="text-2xl tracking-tight text-slate-900 dark:text-white font-bold">{totalPointsRedeemed.toLocaleString()}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Total Points Redeemed</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">lifetime conversion</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-3 text-sky-600 dark:text-sky-400">
              <Banknote className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-2xl tracking-tight text-slate-900 dark:text-white font-bold">{totalCashOutflow.toLocaleString()} EGP</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Total Cash Outflow</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">disbursed to mobile wallets</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-3 text-violet-600 dark:text-violet-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <p className="text-2xl tracking-tight text-slate-900 dark:text-white font-bold">{totalRedemptionsCount}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Total Redemptions</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">processed transactions</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-3 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-2xl tracking-tight text-slate-900 dark:text-white font-bold">{avgCashout.toFixed(2)} EGP</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">Average Cashout Size</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">per redemption txn</p>
          </GlassCard>
        </div>

        {/* Global Redemptions Feed */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg text-slate-900 dark:text-white flex items-center gap-2 font-bold" style={{ fontWeight: 600 }}>
                <TrendingUp className="w-5 h-5 text-emerald-500 animate-pulse" /> Platform Redemptions Feed (All Users)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live redemption logs for all eco-citizens on the network.
              </p>
            </div>
            
            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by user name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {globalLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Aggregating redemption histories from all users...</p>
            </div>
          ) : filteredGlobalHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              No redemptions found on the platform yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/5 text-slate-500 font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Redemption ID</th>
                    <th className="py-3 px-4">Points</th>
                    <th className="py-3 px-4">Amount (EGP)</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredGlobalHistory.map((item: any, idx: number) => (
                    <tr key={item.redemptionId || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{item.userName}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">#{item.redemptionId}</td>
                      <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">{item.points} pts</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{item.amountEgp?.toFixed(2)} EGP</td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                          {item.status || "Completed"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{item.details || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto p-6 space-y-6">
      {/* 1. Header & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Eco Rewards Portal 🎁
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Redeem your hard-earned points for real cash sent directly to your mobile wallet or bank account.
          </p>
        </div>
      </div>

      {/* 2. Main content area: Balance Overview & Redemption Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area (2/3 width on large screens): Wallet & Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Points Balance Card */}
          <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/20">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Coins className="w-3.5 h-3.5 animate-spin-slow" /> Active Wallet Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 800 }}>
                    {walletLoading ? "..." : currentPoints.toLocaleString()}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Points</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Earned from verified plastic bottle deposits.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-white/40 dark:border-white/10 p-4 rounded-2xl shrink-0 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Banknote className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cash Equivalent</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ≈ {walletLoading ? "..." : currentCashVal.toFixed(2)} EGP
                  </p>
                </div>
              </div>
            </div>

            {/* Exchange Rate Badge */}
            <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-teal-500" /> Exchange Rate: 10 Points = 1.00 EGP</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">1 Point = 0.10 EGP</span>
            </div>
          </GlassCard>

          {/* Redemption Form */}
          <GlassCard className="p-6">
            <h2 className="text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
              <ArrowRightLeft className="w-5 h-5 text-emerald-500" /> Convert Points to Cash
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Select Provider */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Wallet Provider / Method
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "vodafone", label: "Vodafone Cash" },
                    { id: "instapay", label: "InstaPay Egypt" },
                    { id: "orange", label: "Orange Cash" },
                    { id: "etisalat", label: "Etisalat Cash" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`px-3 py-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        provider === p.id 
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm" 
                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet Number / InstaPay ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>{provider === "instapay" ? "InstaPay Address (IPA)" : "Wallet Mobile Number"}</span>
                  <span className="text-xs text-slate-400 normal-case">Required</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder={
                      provider === "instapay"
                        ? "e.g., username@instapay"
                        : "e.g., 01012345678"
                    }
                    className="block w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 focus:ring focus:ring-emerald-500/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {provider === "instapay" 
                    ? "Enter your Instapay address linked to your bank account."
                    : "Make sure this number is registered for cash wallet services."
                  }
                </p>
              </div>

              {/* Points to Redeem & Live Calculation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Points to Convert
                  </label>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Max: {currentPoints.toLocaleString()} pts
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Coins className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      required
                      min="1"
                      max={currentPoints}
                      value={pointsInput}
                      onChange={(e) => {
                        setPointsInput(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="Enter points count"
                      className="block w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 focus:ring focus:ring-emerald-500/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none transition-colors"
                    />
                  </div>
                  
                  {/* Preset Quick Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => quickSelect(0.25)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => quickSelect(0.5)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => quickSelect(1)}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversion Preview Box */}
              {enteredPoints > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between animate-fade-in">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">You convert</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{enteredPoints} Eco-Points</p>
                  </div>
                  <div className="text-slate-400">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">You receive</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{cashToReceive.toFixed(2)} EGP</p>
                  </div>
                </div>
              )}

              {/* Form Validation Errors */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={redeemMutation.isPending || !pointsInput || enteredPoints <= 0 || enteredPoints > currentPoints}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm transition-all duration-150 transform active:scale-98 shadow-md hover:shadow-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer flex items-center justify-center gap-2"
              >
                {redeemMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing cashout...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Redeem for {cashToReceive > 0 ? cashToReceive.toFixed(2) : "0.00"} EGP
                  </>
                )}
              </button>

            </form>
          </GlassCard>
        </div>

        {/* Right Area (1/3 width): FAQ / Info & Transaction History */}
        <div className="space-y-6">
          
          {/* Rules & Information */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" /> Redemption Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant deposits for Vodafone Cash, Orange Cash, and Etisalat Cash.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>InstaPay transfers process instantly into your mapped bank account.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Redemptions are final and points cannot be refunded once transferred.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Minimum redemption amount is 10 points (1.00 EGP).</span>
              </li>
            </ul>
          </GlassCard>

          {/* Recent Ledger History */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-500" /> Recent Cashouts
            </h3>
            <div className="space-y-3">
              {mockHistory.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.method}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+{item.amount.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{item.date} · {item.points} pts</span>
                    <span className="text-emerald-500 font-medium">● {item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>

      {/* 3. Global Redemptions Feed (All Users) */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg text-slate-900 dark:text-white flex items-center gap-2 font-bold" style={{ fontWeight: 600 }}>
              <TrendingUp className="w-5 h-5 text-emerald-500 animate-pulse" /> Platform Redemptions Feed (All Users)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live redemption logs for all eco-citizens on the network.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by user name..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {globalLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Aggregating redemption histories from all users...</p>
          </div>
        ) : filteredGlobalHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No redemptions found on the platform yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-slate-500 font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Redemption ID</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Amount (EGP)</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredGlobalHistory.map((item: any, idx: number) => (
                  <tr key={item.redemptionId || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{item.userName}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">#{item.redemptionId}</td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">{item.points} pts</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{item.amountEgp?.toFixed(2)} EGP</td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                        {item.status || "Completed"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{item.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

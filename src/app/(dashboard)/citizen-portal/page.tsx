"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { useAuth } from "@/store/authStore";
import { useUserWallet } from "@/hooks/useUserWallet";
import { usePickupHistory } from "@/hooks/usePickupHistory";
import { useUploadEcoSnap } from "@/hooks/useEcoSnap";
import { toast } from "sonner";

// Import modular subcomponents
import { HeroSection } from "./components/HeroSection";
import { EcoSnapCard } from "./components/EcoSnapCard";
import { ImpactGrid } from "./components/ImpactGrid";
import { QuickActions } from "./components/QuickActions";
import { RecentActivity } from "./components/RecentActivity";
import { SupportCard } from "./components/SupportCard";
import { RankCard } from "./components/RankCard";

/* Citizen levels mirror the public progression tiers. */
const LEVELS = [
  { level: 1, title: "Beginner", min: 0, max: 499 },
  { level: 2, title: "Newcomer", min: 500, max: 999 },
  { level: 3, title: "Contributor", min: 1000, max: 2499 },
  { level: 4, title: "Activist", min: 2500, max: 4999 },
  { level: 5, title: "Champion", min: 5000, max: 9999 },
  { level: 6, title: "Hero", min: 10000, max: 19999 },
  { level: 7, title: "Legend", min: 20000, max: 49999 },
  { level: 8, title: "Master", min: 50000, max: 99999 },
  { level: 9, title: "Grand Master", min: 100000, max: 249999 },
  { level: 10, title: "Eco Guardian", min: 250000, max: Infinity },
];

function levelFor(points: number) {
  const idx = LEVELS.findIndex((l) => points >= l.min && points <= l.max);
  const current = idx >= 0 ? LEVELS[idx] : LEVELS[LEVELS.length - 1];
  const next = LEVELS[Math.min(idx + 1, LEVELS.length - 1)];
  const span = Math.max(current.max === Infinity ? current.min : current.max - current.min, 1);
  const progress = current.max === Infinity
    ? 100
    : Math.min(100, Math.round(((points - current.min) / span) * 100));
  return { current, next, progress, toNext: next.max === Infinity ? 0 : Math.max(0, next.min - points) };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function CitizenPortalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const snapFileRef = useRef<HTMLInputElement>(null);
  
  const { data: walletData, isLoading } = useUserWallet(user?.id);
  const { data: history = [], isLoading: historyLoading } = usePickupHistory(user?.id);
  const uploadEcoSnapMutation = useUploadEcoSnap();

  const walletPoints = walletData?.walletPoints ?? 0;
  const entries: any[] = [];

  useEffect(() => {
    setMounted(true);
  }, []);



 const handleSnapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];

   if (file) {
     uploadEcoSnapMutation.mutate(file);
   }

   e.target.value = "";
 };


 
  const balance = walletPoints;
  const earned = walletPoints;

  const bottles = Math.round(earned / 5);
  const co2 = Math.round(bottles * 0.5);
  const trees = Math.round(bottles / 100);
  const { current, next, progress, toNext } = levelFor(earned);

  const recent = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [entries]
  );

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Leaf className="w-10 h-10 text-emerald-500 animate-bounce" />
          <p className="text-emerald-600/80 font-medium text-lg">Loading your eco-impact...</p>
        </div>
      </div>
    );
  }

  const firstName = (user?.name ?? "Friend").split(/\s+/)[0];

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* 1. Hero Welcome & Progress */}
      <HeroSection
        currentLevel={current.level}
        currentTitle={current.title}
        firstName={firstName}
        balance={balance}
        toNext={toNext}
        nextTitle={next.title}
        progress={progress}
      />

      {/* 2. EcoSnap Camera Verification */}
      <EcoSnapCard
        uploadingSnap={uploadEcoSnapMutation.isPending}
        onUpload={handleSnapUpload}
        snapFileRef={snapFileRef}
      />

      {/* 3. Impact Stats Cards Grid */}
      <ImpactGrid
        bottles={bottles}
        balance={balance}
        co2={co2}
        trees={trees}
      />

      {/* 4. Ranking Card */}
      {user?.id && <RankCard userId={String(user.id)} />}

      {/* 5. Quick Actions Shortcuts */}
      <QuickActions onNavigate={(to) => router.push(to)} />

      {/* 6. Recent Points Movement Activity Feed */}
      <RecentActivity
        history={history}
        recent={recent}
        loading={historyLoading}
        formatDate={formatDate}
      />

      {/* 7. Support Assistance Card */}
      <SupportCard onClick={() => router.push("/support")} />
    </div>
  );
}

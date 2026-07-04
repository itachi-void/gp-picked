"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/store/authStore";
import { GlassCard } from "@/app/components/GlassCard";
import {
  Mail,
  Phone,
  MapPin,
  Coins,
  User as UserIcon,
  Settings,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import "@/app/components/motion/motion-components.css";
import Link from "next/link";

interface UserDetails {
  userId: number;
  fullName: string;
  email: string;
  walletPoints?: number | null;
  phone?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const role = String(user?.role ?? "").toLowerCase();

  const { data, isLoading, isError } = useQuery<UserDetails>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await api.get<UserDetails>(
        `/User/GetUserByIdWithDetails/${userId}`
      );
      return res.data;
    },
    enabled: !!userId,
  });

  const name = data?.fullName ?? user?.name ?? "—";
  const email = data?.email ?? user?.email ?? "—";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const infoRows: { icon: any; label: string; value: string | number | null | undefined; available: boolean }[] = [
    { icon: Mail, label: "Email", value: email, available: true },
    {
      icon: Phone,
      label: "Phone",
      value: data?.phone ?? null,
      available: !!data?.phone,
    },
    {
      icon: MapPin,
      label: "Address",
      value: data?.address ?? null,
      available: !!data?.address,
    },
    {
      icon: Coins,
      label: "Wallet Points",
      value: data?.walletPoints != null ? `${data.walletPoints.toLocaleString()} pts` : null,
      available: data?.walletPoints != null,
    },
    {
      icon: ShieldCheck,
      label: "Role",
      value: user?.role ?? "—",
      available: true,
    },
  ];

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1
            className="text-3xl tracking-tight text-slate-900 dark:text-white"
            style={{ fontWeight: 700 }}
          >
            My Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Your account information from the system
          </p>
        </div>
      </div>

      {isLoading ? (
        <GlassCard className="p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
          <span className="text-slate-500 dark:text-slate-400 text-sm">
            Loading profile…
          </span>
        </GlassCard>
      ) : isError ? (
        <GlassCard className="p-10 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-500" />
          <p className="text-sm text-rose-500">
            Failed to load profile data. Please try again.
          </p>
        </GlassCard>
      ) : (
        <div className="mc-fade-in grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Avatar Card */}
          <GlassCard className="p-6 flex flex-col items-center gap-4 text-center h-fit">
            {data?.profilePictureUrl ? (
              <img
                src={data.profilePictureUrl}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg"
                style={{ fontWeight: 700 }}
              >
                {initials}
              </div>
            )}
            <div>
              <h2
                className="text-lg text-slate-900 dark:text-white"
                style={{ fontWeight: 700 }}
              >
                {name}
              </h2>
              <span className="inline-block mt-1 px-3 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                {user?.role ?? "User"}
              </span>
            </div>

            <Link
              href="/settings"
              className="mt-2 flex items-center gap-2 px-4 h-9 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold hover:bg-white dark:hover:bg-white/10 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit in Settings
            </Link>
          </GlassCard>

          {/* Info Card */}
          <GlassCard className="p-6 space-y-3">
            <h3
              className="text-base text-slate-900 dark:text-white mb-4"
              style={{ fontWeight: 600 }}
            >
              Account Details
            </h3>
            {infoRows.map(({ icon: Icon, label, value, available }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl"
              >
                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {label}
                  </p>
                  {available && value != null ? (
                    <p
                      className="text-sm text-slate-900 dark:text-white mt-0.5 break-all"
                      style={{ fontWeight: 600 }}
                    >
                      {String(value)}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5 italic">
                      Not yet from api
                    </p>
                  )}
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  );
}

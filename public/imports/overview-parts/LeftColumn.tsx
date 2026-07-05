"use client";

import { useEffect, useState } from "react";
import dynamic from "@/shims/next-dynamic";
import { motion } from "framer-motion";
import { MapPin, Phone, Flame, Clock } from "lucide-react";
import { notify } from "@/app/utils/notifications";

function useElapsed(requestId: string) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 60_000);
    return () => clearInterval(id);
  }, [requestId]);
  // simulate a starting offset so the badge isn't always 0
  const total = elapsed + (Math.abs(hashCode(requestId)) % 17) + 1;
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

const OverviewMap = dynamic(() => import("../OverviewMap"), { ssr: false });

interface Props {
  isGlass: boolean;
  activeRequest: any;
  totalWeight: number;
  totalQuantity: number;
  percentCapacity: number;
  pinCount: number;
}

export default function LeftColumn({
  isGlass,
  activeRequest,
  totalWeight,
  totalQuantity,
  percentCapacity,
  pinCount,
}: Props) {
  const elapsed = useElapsed(activeRequest.id);
  return (
    <div className="xl:col-span-3 flex flex-col gap-6">
      {/* Selected Request Details */}
      <div
        className={`${
          isGlass
            ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_1px_rgba(0,229,255,0.08)]"
            : "bg-white dark:bg-gradient-to-b dark:from-[#1b2028] dark:via-[#13171f] dark:to-[#0c1017] border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
        } text-slate-900 dark:text-white p-6 rounded-[36px] flex flex-col gap-5 relative overflow-hidden transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3.5 z-10">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-black uppercase ${
                isGlass ? "bg-white/50 dark:bg-white/[0.05]" : "bg-slate-100 dark:bg-black/40"
              } px-3 py-1 rounded-full tracking-widest text-slate-600 dark:text-white/90`}
            >
              Request
            </span>
            <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-white/60">{activeRequest.id}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/70">
              <Clock className="w-2.5 h-2.5" />
              {elapsed}
            </span>
            <span
              className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-md shadow-sm ${
                activeRequest.priority === "Critical"
                  ? "bg-red-500 text-white animate-pulse"
                  : isGlass
                    ? "bg-[#4ED0F5] text-[#131518]"
                    : "bg-[#0891B2] dark:bg-[#00E5FF] text-white dark:text-[#131518]"
              }`}
            >
              {activeRequest.priority}
            </span>
          </div>
        </div>

        <div className="z-10">
          <h2 className="text-2xl font-black tracking-tight uppercase leading-none mb-1.5 text-slate-900 dark:text-white">
            {activeRequest.citizen.name}
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-white/60 font-black uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className={`w-3.5 h-3.5 ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"}`} />
            {activeRequest.zone.name}
          </p>
        </div>

        <div
          className={`grid grid-cols-2 gap-4 ${
            isGlass
              ? "bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.04]"
              : "bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5"
          } p-4 rounded-2xl z-10`}
        >
          <div>
            <p className="text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1">Est. Weight</p>
            <p className="text-xl font-black leading-none text-slate-900 dark:text-white">
              {totalWeight.toFixed(1)} <span className="text-xs font-semibold text-slate-500 dark:text-white/55">kg</span>
            </p>
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest mb-1">Quantity</p>
            <p className="text-xl font-black leading-none text-slate-900 dark:text-white">
              {totalQuantity} <span className="text-xs font-semibold text-slate-500 dark:text-white/55">pcs</span>
            </p>
          </div>
        </div>

        <div className="z-10">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-white/60">
            <span>Used Capacity</span>
            <span className={`${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"} font-black`}>
              {percentCapacity}%
            </span>
          </div>
          <div
            className={`h-2 w-full ${
              isGlass ? "bg-slate-100/50 dark:bg-white/5" : "bg-slate-100 dark:bg-black/40"
            } rounded-full overflow-hidden`}
          >
            <div
              className={`h-full bg-gradient-to-r ${
                isGlass ? "from-cyan-400 to-[#4ED0F5]" : "from-cyan-500 to-blue-500"
              } rounded-full`}
              style={{ width: `${percentCapacity}%` }}
            />
          </div>
        </div>

        <div
          className={`flex items-center justify-between ${
            isGlass
              ? "bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.04]"
              : "bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5"
          } p-4 rounded-2xl z-10`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-black text-white text-xs shadow-md">
              {activeRequest.driver ? activeRequest.driver.name.slice(0, 2).toUpperCase() : "?"}
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 dark:text-white/50 uppercase tracking-widest leading-none mb-1">
                Assigned Driver
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {activeRequest.driver ? activeRequest.driver.name : "Dispatcher Queue"}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              activeRequest.driver && notify.info("Calling Driver", `Connecting line to ${activeRequest.driver.name}...`)
            }
            className={`w-9 h-9 rounded-xl ${
              isGlass
                ? "bg-[#4ED0F5]/10 hover:bg-[#4ED0F5]/20 text-[#4ED0F5] border border-[#4ED0F5]/10"
                : "bg-cyan-50 dark:bg-[#00E5FF]/10 hover:bg-cyan-100 dark:hover:bg-[#00E5FF]/20 text-[#0891B2] dark:text-[#00E5FF] border border-cyan-100 dark:border-[#00E5FF]/10"
            } flex items-center justify-center transition-colors`}
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5 z-10">
          <div
            className={`p-3.5 ${
              isGlass
                ? "bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.04]"
                : "bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5"
            } flex flex-col justify-between h-[70px]`}
          >
            <span className="text-[8px] font-black uppercase text-slate-400 dark:text-white/55 tracking-widest">Status Index</span>
            <span className={`text-xs font-black uppercase ${isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"}`}>
              {activeRequest.status}
            </span>
          </div>
          <div
            className={`p-3.5 ${
              isGlass
                ? "bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.04]"
                : "bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5"
            } flex flex-col justify-between h-[70px]`}
          >
            <span className="text-[8px] font-black uppercase text-slate-400 dark:text-white/55 tracking-widest">Plastic Type</span>
            <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400">
              {activeRequest.items[0]?.plasticType ?? "PET"}
            </span>
          </div>
        </div>
      </div>

      {/* Live Route Map */}
      <div
        className={`${
          isGlass
            ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            : "bg-white dark:bg-[#0c1017]/80 backdrop-blur-xl border border-slate-200 dark:border-[#00E5FF]/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        } text-slate-900 dark:text-white p-4 rounded-[32px] flex flex-col gap-4 flex-1 min-h-[300px] overflow-hidden relative transition-all duration-300`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3 shrink-0">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-widest ${
              isGlass
                ? "text-[#4ED0F5] dark:drop-shadow-[0_0_8px_rgba(78,208,245,0.4)]"
                : "text-[#0891B2] dark:text-[#00E5FF] dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]"
            } flex items-center gap-1.5`}
          >
            <Flame className="w-3.5 h-3.5" />
            Live Route Map · {pinCount} pins
          </span>
          <div className="flex items-center gap-1.5">
            <motion.div
              className={`w-1.5 h-1.5 ${isGlass ? "bg-[#4ED0F5]" : "bg-[#00E5FF]"} rounded-full hidden dark:block`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span
              className={`text-[8px] font-extrabold ${
                isGlass ? "bg-white/50 dark:bg-white/[0.06]" : "bg-slate-100 dark:bg-[#0e1420]"
              } text-slate-500 dark:text-white/60 uppercase tracking-widest px-2.5 py-0.5 rounded-full`}
            >
              Interactive
            </span>
          </div>
        </div>

        <div
          className={`flex-1 w-full h-full rounded-2xl overflow-hidden border-2 ${
            isGlass ? "border-white/20 dark:border-[#4ED0F5]/25" : "border-slate-200/50 dark:border-[#00E5FF]/25"
          } min-h-[220px] shadow-[0_4px_12px_rgba(226,232,240,0.3)] dark:shadow-[inset_0_0_30px_rgba(0,229,255,0.06),0_0_25px_rgba(0,229,255,0.1)]`}
        >
          <OverviewMap />
        </div>

        <div
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-16 ${
            isGlass ? "bg-[#4ED0F5]/10" : "bg-[#0891B2]/3 dark:bg-[#00E5FF]/8"
          } rounded-full blur-3xl pointer-events-none`}
        />
      </div>
    </div>
  );
}

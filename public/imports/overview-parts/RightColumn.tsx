"use client";

import { useNavigate } from "react-router";
import { motion } from "framer-motion";

interface Props {
  isGlass: boolean;
  requests: any[];
  selectedRequestId: string;
  setSelectedRequestId: (id: string) => void;
}

export default function RightColumn({ isGlass, requests, selectedRequestId, setSelectedRequestId }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className={`xl:col-span-3 ${
        isGlass
          ? "bg-white/80 dark:bg-[#0a0e14]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
          : "bg-white dark:bg-[#0c1017]/80 backdrop-blur-xl border border-slate-200 dark:border-[#00E5FF]/15 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
      } text-slate-900 dark:text-white p-5 rounded-[32px] flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 min-h-[500px]`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent dark:bg-gradient-to-r dark:from-transparent dark:via-[#00E5FF]/60 dark:to-transparent z-20" />

      <div className="space-y-4 relative z-10 w-full">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-widest ${
              isGlass
                ? "text-[#4ED0F5] dark:drop-shadow-[0_0_8px_rgba(78,208,245,0.4)]"
                : "text-[#0891B2] dark:text-[#00E5FF] dark:drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]"
            }`}
          >
            Collection Pipeline
          </span>
          <button
            onClick={() => navigate("/pickups")}
            className={`text-[9px] ${
              isGlass ? "text-[#4ED0F5]" : "text-[#0891B2] dark:text-[#00E5FF]"
            } hover:text-cyan-700 dark:hover:text-cyan-300 font-extrabold uppercase tracking-widest transition-colors cursor-pointer`}
          >
            Manage All
          </button>
        </div>

        <div className="space-y-3.5 overflow-y-auto no-scrollbar max-h-[420px] pr-1">
          {requests.map((req: any) => {
            const totalQ = req.items.reduce((s: number, i: any) => s + i.expectedQuantity, 0);
            const reqCapacity = Math.min(100, Math.round((totalQ / 400) * 100));
            const isSelected = req.id === selectedRequestId;

            return (
              <motion.div
                key={req.id}
                onClick={() => setSelectedRequestId(req.id)}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                  isSelected
                    ? isGlass
                      ? "bg-[#4ED0F5]/5 dark:bg-[#4ED0F5]/[0.07] border-[#4ED0F5]/40 dark:border-[#4ED0F5]/35 shadow-[0_4px_15px_rgba(78,208,245,0.06)] dark:shadow-[0_0_20px_rgba(78,208,245,0.15)]"
                      : "bg-[#0891B2]/5 dark:bg-[#00E5FF]/[0.07] border-[#0891B2]/40 dark:border-[#00E5FF]/35 shadow-[0_4px_15px_rgba(8,145,178,0.06)] dark:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                    : isGlass
                      ? "bg-slate-50/60 dark:bg-[#0e1420] border-slate-200/50 dark:border-white/[0.06] hover:bg-slate-100/80 dark:hover:bg-[#222930] hover:shadow-sm"
                      : "bg-slate-50/50 dark:bg-[#0e1420] border-slate-200/50 dark:border-white/[0.06] hover:bg-slate-100/60 dark:hover:bg-[#222930] hover:shadow-sm"
                }`}
              >
                {isSelected && (
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2.5px] ${
                      isGlass ? "bg-[#4ED0F5] dark:bg-gradient-to-r dark:from-[#4ED0F5]/80" : "bg-[#0891B2] dark:bg-gradient-to-r dark:from-[#00E5FF]/80"
                    } dark:via-blue-500/40 dark:to-transparent`}
                  />
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm truncate max-w-[150px]">{req.citizen.name}</h4>
                    <p className="text-[9px] text-slate-400 dark:text-white/40 font-semibold">{req.zone.name}</p>
                  </div>
                  <span
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      req.priority === "Critical"
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/70"
                    }`}
                  >
                    {req.id}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 dark:text-white/50 font-bold mt-1">
                  <span>Volume: {totalQ} pcs</span>
                  <span className="text-slate-900 dark:text-white">{reqCapacity}%</span>
                </div>

                <div
                  className={`h-1.5 w-full ${
                    isGlass ? "bg-white/20 dark:bg-white/10" : "bg-slate-100 dark:bg-white/10"
                  } rounded-full overflow-hidden dark:shadow-[0_0_6px_rgba(0,229,255,0.15)]`}
                >
                  <div
                    className={`h-full bg-gradient-to-r ${
                      isGlass ? "from-cyan-400 to-[#4ED0F5] dark:from-[#4ED0F5]" : "from-cyan-500 to-blue-500 dark:from-[#00E5FF]"
                    } dark:to-blue-500 dark:shadow-[0_0_8px_rgba(0,229,255,0.3)]`}
                    style={{ width: `${reqCapacity}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#0891B2]/6 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#0891B2]/3 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}

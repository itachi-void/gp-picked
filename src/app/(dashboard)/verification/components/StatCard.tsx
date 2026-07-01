"use client";

interface StatCardProps {
  label: string;
  value: number;
  accent: "amber" | "emerald" | "rose";
}

export function StatCard({ label, value, accent }: StatCardProps) {
  const cls = {
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rose: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  }[accent];
  
  return (
    <div className={`px-4 py-2 rounded-2xl ${cls}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide opacity-80 font-semibold">{label}</div>
    </div>
  );
}

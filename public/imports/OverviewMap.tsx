import { MapPin, Truck } from "lucide-react";
import { usePickup } from "@/app/contexts/PickupContext";
import { useDrivers } from "@/app/contexts/DriversContext";

export default function OverviewMap() {
  const { requests } = usePickup();
  const { drivers } = useDrivers();

  const points = [
    ...requests.map((r, i) => ({
      id: r.id,
      label: r.citizen.name,
      sub: r.zone.name,
      top: 20 + (i * 17) % 60,
      left: 15 + (i * 23) % 70,
      type: "req" as const,
    })),
    ...drivers.map((d, i) => ({
      id: d.id,
      label: d.name,
      sub: `Zone: ${d.zone}`,
      top: 30 + (i * 19) % 55,
      left: 30 + (i * 27) % 60,
      type: "drv" as const,
    })),
  ];

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-emerald-50 dark:from-[#0a0e14] dark:via-[#0c1218] dark:to-[#0a141b]">
      <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-cyan-400 dark:text-cyan-300" />
      </svg>

      {points.map((p) => (
        <div
          key={`${p.type}-${p.id}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 group"
          style={{ top: `${p.top}%`, left: `${p.left}%` }}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-white/20 ${
              p.type === "req" ? "bg-cyan-500" : "bg-emerald-500"
            }`}
          >
            {p.type === "req" ? (
              <MapPin className="w-3.5 h-3.5 text-white" />
            ) : (
              <Truck className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <span
            className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
              p.type === "req" ? "bg-cyan-500" : "bg-emerald-500"
            }`}
          />
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 whitespace-nowrap bg-white dark:bg-[#0a0e14] px-2 py-1 rounded-md shadow-lg text-[10px] font-bold text-slate-700 dark:text-white/80">
            {p.label}
            <span className="block text-[9px] opacity-60 font-medium">{p.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

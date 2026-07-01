import { Boxes, Building2, Factory, Truck, Warehouse } from 'lucide-react';
import React from 'react'

function Map() {
  return (
    <div className="relative w-full h-[300px] bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden p-4">
      
      {/* ========== ١. المراكز - مجرد cards صغيرة ========== */}
      <div className="grid grid-cols-3 gap-3 h-full">
        
        {/* مركز ١ */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-cyan-500 text-white shadow-lg">
            <Boxes className="w-8 h-8" />
            <span className="text-xs font-bold">Main Hub</span>
            <span className="text-2xl font-black">67%</span>
          </div>
        </div>

        {/* مركز ٢ */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-violet-500 text-white shadow-lg">
            <Building2 className="w-8 h-8" />
            <span className="text-xs font-bold">Sorting</span>
            <span className="text-2xl font-black">89%</span>
          </div>
        </div>

        {/* مركز ٣ */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-500 text-white shadow-lg">
            <Factory className="w-8 h-8" />
            <span className="text-xs font-bold">Processing</span>
            <span className="text-2xl font-black">78%</span>
          </div>
        </div>

        {/* مركز ٤ */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500 text-white shadow-lg">
            <Truck className="w-8 h-8" />
            <span className="text-xs font-bold">Distribution</span>
            <span className="text-2xl font-black">65%</span>
          </div>
        </div>

        {/* مركز ٥ */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-sky-500 text-white shadow-lg">
            <Warehouse className="w-8 h-8" />
            <span className="text-xs font-bold">East Station</span>
            <span className="text-2xl font-black">84%</span>
          </div>
        </div>

        {/* حالة الاتصال */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600">LIVE</span>
            </div>
            <span className="text-xs text-slate-500">5 Centers Online</span>
            <span className="text-xs text-slate-400">All Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Map
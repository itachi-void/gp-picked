"use client";

import React from "react";

interface LiquidProgressProps {
  progress: number; // 0..1
}

export function LiquidProgress({ progress }: LiquidProgressProps) {
  return (
    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative rounded-full transition-[width] duration-500 ease-out overflow-hidden"
        style={{ width: `${progress * 100}%`, boxShadow: "0 0 20px rgba(16,185,129,0.5)" }}
      >
        {/* طبقة لمعان بتمشي وتدي إحساس السائل */}
        <div className="absolute inset-0 bg-white/30 animate-shimmer-sweep" />
      </div>
    </div>
  );
}

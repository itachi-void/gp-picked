"use client";

import React from "react";

interface LiquidProgressProps {
  progress: number; // 0..1
}

export function LiquidProgress({ progress }: LiquidProgressProps) {
  return (
    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
      <div
        style={{
          width: `${progress * 100}%`,
          borderRadius: "9999px",
          boxShadow: "0 0 20px rgba(16,185,129,0.5)",
        }}
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative transition-[width] duration-500 ease-out"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-pass" />
      </div>
    </div>
  );
}

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
}

"use client";

import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  showBeta?: boolean;
}

export function SectionHeading({ title, subtitle, showBeta }: SectionHeadingProps) {
  return (
    <div data-aos="fade-up" className="text-center mb-16">
      <div className="inline-flex items-center justify-center gap-3 mb-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          {title}
        </h2>
        {showBeta && (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm animate-pulse select-none">
            Beta
          </span>
        )}
      </div>
      {subtitle && <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

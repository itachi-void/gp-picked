"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* Logo Icon with scanner brackets */}
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
        {/* Outer Scanner Brackets [ ] in Teal */}
        <div className="absolute inset-0 border-[2.5px] border-transparent border-t-teal-500 border-b-teal-500 border-l-teal-500 rounded-lg opacity-90" style={{ width: '40%', height: '100%' }} />
        <div className="absolute inset-0 border-[2.5px] border-transparent border-t-teal-500 border-b-teal-500 border-r-teal-500 rounded-lg opacity-90 ml-auto" style={{ width: '40%', height: '100%' }} />
        
        {/* Center Bottle & Arrow Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="w-5 h-5 text-emerald-600 dark:text-emerald-400 relative z-10"
        >
          {/* Bottle body */}
          <path
            d="M8.5 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v1.5M7 11h10a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 7 11z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Recycling arrows */}
          <path
            d="M5 15a7 7 0 0 1 11-5.5M19 9a7 7 0 0 1-11 5.5"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span className="font-extrabold tracking-tight text-sm text-slate-800 dark:text-white flex items-center">
        <span className="text-emerald-700 dark:text-emerald-400">Eco</span>
        <span className="text-teal-600 dark:text-teal-300">Snap</span>
      </span>
    </Link>
  );
}
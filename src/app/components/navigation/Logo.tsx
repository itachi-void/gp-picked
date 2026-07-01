"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 flex items-center justify-center shadow-md">
        <div className="w-3.5 h-3.5 bg-white rounded-full" />
      </div>
      <span className="font-black tracking-wider text-sm">ECOVOID</span>
    </Link>
  );
}
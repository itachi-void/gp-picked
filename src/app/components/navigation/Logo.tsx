"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <img src="/logo.png" alt="EcoSnap" className="h-8 w-auto object-contain" />
    </Link>
  );
}
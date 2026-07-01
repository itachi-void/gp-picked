"use client";

import { Suspense } from "react";
import { AuthPageWrapper } from "@/app/components/auth/AuthPageWrapper";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <AuthPageWrapper mode="login" />
    </Suspense>
  );
}

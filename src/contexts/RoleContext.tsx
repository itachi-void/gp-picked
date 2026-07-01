"use client";

import { useAuth } from "@/store/authStore";

export function useRoleContext() {
  const user = useAuth((state) => state.user);
  return {
    role: user?.role ?? "User",
    user,
  };
}

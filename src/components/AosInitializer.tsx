"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "@/store/authStore";

export default function AosInitializer() {
  const initializeAuth = useAuth((state) => state.initialize);

  useEffect(() => {
    // Rehydrate auth session from localStorage on mount
    initializeAuth();

    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, [initializeAuth]);

  return null;
}

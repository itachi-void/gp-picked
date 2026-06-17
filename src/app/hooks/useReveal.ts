"use client";

import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  once?: boolean;
  margin?: string;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>({
  once = true,
  margin = "0px 0px -50px 0px",
}: UseRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            observer.unobserve(current);
          }
        } else {
          if (!once) {
            setInView(false);
          }
        }
      },
      {
        rootMargin: margin,
        threshold: 0.1,
      }
    );

    observer.observe(current);

    return () => {
      observer.disconnect();
    };
  }, [once, margin]);

  return [ref, inView] as const;
}

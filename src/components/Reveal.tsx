"use client";

import React from "react";
import { useReveal } from "@/app/hooks/useReveal";

type RevealProps = {
  /** Reveal style — maps to a `.reveal-*` base class in landing-animations.css. */
  variant?: "up" | "up-sm" | "scale" | "scale-sm" | "fade" | "left";
  /** Stagger delay in seconds (applied as CSS transition-delay). */
  delay?: number;
  /** Re-trigger each time it enters/leaves the viewport (default: once). */
  repeat?: boolean;
  margin?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "style" | "className">;

/**
 * Reveal — drop-in replacement for Motion's `whileInView` reveals.
 * Pure CSS transition driven by an IntersectionObserver (see useReveal).
 */
export function Reveal({
  variant = "up",
  delay = 0,
  repeat = false,
  margin,
  className = "",
  style,
  children,
  ...rest
}: RevealProps) {
  const [ref, inView] = useReveal<HTMLDivElement>({ once: !repeat, margin });

  return (
    <div
      ref={ref}
      className={`reveal-${variant} ${inView ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: delay ? `${delay}s` : undefined, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Reveal;

"use client";

import React, { useEffect, useState } from "react";

/**
 * MaskWipeText — premium left-to-right reveal (Apple / Stripe style).
 *
 * The text stays static while a clip mask wipes across it from left to right,
 * uncovering it cleanly. No per-character or per-word churn — one calm sweep.
 */
export function MaskWipeText({
  text,
  className = "",
  delay = 350,
  duration = 1000,
}: {
  text: string;
  className?: string;
  delay?: number; // ms
  duration?: number; // ms
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        clipPath: revealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
      }}
      className={`inline-block transition-[clip-path] ${className}`}
    >
      {text}
    </span>
  );
}

export default MaskWipeText;

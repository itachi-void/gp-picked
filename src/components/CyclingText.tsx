"use client";

import { useEffect, useState } from "react";

/**
 * CyclingText — calm phrase rotator.
 *
 * Crossfades between phrases with a soft CSS transition. No per-character churn,
 * just one clean reveal per phrase on a gentle easing curve.
 */
export function CyclingText({
  texts,
  interval = 2600,
  className = "text-emerald-600",
}: {
  texts: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setIndex((p) => (p + 1) % texts.length);
        setAnimate(true);
      }, 300); // Delay text update until fade-out is complete
    }, interval);

    return () => window.clearInterval(id);
  }, [texts, interval]);

  return (
    <span className="relative inline-block align-bottom">
      <span className="invisible whitespace-nowrap">{texts[index]}</span>
      <span
        className={`absolute inset-0 whitespace-nowrap transition-all duration-300 transform ${
          animate ? "opacity-100 translate-y-0 blur-none" : "opacity-0 -translate-y-4 blur-[4px]"
        } ${className}`}
      >
        {texts[index]}
      </span>
    </span>
  );
}

export default CyclingText;

"use client";

import { useEffect, useState } from "react";

/**
 * CyclingText — calm phrase rotator (CSS-only, no Motion).
 *
 * Crossfades between phrases with a soft blur + slide on each change. The
 * animation is re-triggered by keying the span on the active index so React
 * remounts it and replays the `animate-cycle-in` keyframe.
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

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((p) => (p + 1) % texts.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [texts, interval]);

  return (
    <span className="relative inline-block align-bottom">
      {/* keeps layout height stable while phrases swap */}
      <span className="invisible whitespace-nowrap">{texts[index]}</span>
      <span
        key={index}
        className={`absolute inset-0 whitespace-nowrap animate-cycle-in ${className}`}
      >
        {texts[index]}
      </span>
    </span>
  );
}

export default CyclingText;

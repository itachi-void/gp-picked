"use client";

import CountUp from "react-countup";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  end,
  duration = 2.5,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  return (
    <>
      {prefix}
      <CountUp end={end} duration={duration} separator="," />
      {suffix}
    </>
  );
}
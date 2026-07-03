"use client";

import { useLamp } from "./LampScene";

export default function BulbSwitch({
  position = { top: 20, right: 20 },
}: {
  position?: { top?: number; right?: number; bottom?: number; left?: number };
}) {
  const { masterOn, toggleMaster, warm } = useLamp();
  const on = masterOn;
  const toggle = toggleMaster;
  const I = on ? 1 : 0;

  return (
    <button
      onClick={toggle}
      title={on ? "Turn off" : "Turn on"}
      style={{
        position: "fixed",
        ...position,
        zIndex: 100,
        width: 52,
        height: 64,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        outline: "none",
      }}
    >
      <svg viewBox="0 0 52 64" width="52" height="64">
        <line x1="26" y1="0" x2="26" y2="8" stroke="rgba(120,120,140,0.6)" strokeWidth="1.5" />
        <rect x="20" y="8" width="12" height="10" rx="2" fill="#3a3a44" />
        <line x1="20" y1="11" x2="32" y2="11" stroke="#1a1a20" strokeWidth="0.6" />
        <line x1="20" y1="14" x2="32" y2="14" stroke="#1a1a20" strokeWidth="0.6" />
        <defs>
          <radialGradient id="bulb-glow" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor={`rgba(${warm}, ${0.95 * I})`} />
            <stop offset="60%" stopColor={`rgba(${warm}, ${0.4 * I})`} />
            <stop offset="100%" stopColor={`rgba(${warm}, 0)`} />
          </radialGradient>
          <radialGradient id="bulb-off" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="rgba(220,225,235,0.18)" />
            <stop offset="100%" stopColor="rgba(220,225,235,0.04)" />
          </radialGradient>
          <filter id="bulb-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {on && I > 0.05 && (
          <circle
            cx="26"
            cy="38"
            r="22"
            fill={`rgba(${warm}, ${0.5 * I})`}
            filter="url(#bulb-bloom)"
            opacity={0.9}
          />
        )}
        <ellipse
          cx="26"
          cy="38"
          rx="14"
          ry="16"
          fill={on ? "url(#bulb-glow)" : "url(#bulb-off)"}
          stroke={on ? `rgba(${warm}, ${0.6 * I + 0.2})` : "rgba(200,205,215,0.25)"}
          strokeWidth="1"
        />
        <path
          d="M 22 36 Q 24 42 26 36 Q 28 30 30 36"
          stroke={on ? `rgba(${warm}, ${0.95 * I})` : "rgba(180,185,195,0.35)"}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="21" cy="32" rx="2" ry="4" fill="rgba(255,255,255,0.25)" />
      </svg>
      <div
        style={{
          marginTop: -4,
          fontSize: 9,
          letterSpacing: "2px",
          color: on ? `rgba(${warm}, ${0.7 + 0.3 * I})` : "rgba(180,185,195,0.5)",
          fontFamily: "monospace",
          textAlign: "center",
          transition: "color 0.3s",
        }}
      >
        {on ? "ON" : "OFF"}
      </div>
    </button>
  );
}

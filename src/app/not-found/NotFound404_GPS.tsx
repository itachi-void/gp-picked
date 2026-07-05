import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NotFound404_GPS() {
  const [signalDots, setSignalDots] = useState(0);
  const [scanAngle, setScanAngle] = useState(0);
  const [blips, setBlips] = useState<{ id: number; x: number; y: number; age: number }[]>([]);
  const rafRef = useRef<number>(0);
  const blipIdRef = useRef(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setSignalDots((d) => (d + 1) % 4);
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    let last = 0;
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      setScanAngle((a) => (a + dt * 0.06) % 360);
      setBlips((prev) => {
        const aged = prev.map((b) => ({ ...b, age: b.age + dt })).filter((b) => b.age < 3000);
        if (Math.random() < 0.004) {
          const angle = Math.random() * Math.PI * 2;
          const r = 20 + Math.random() * 75;
          aged.push({
            id: blipIdRef.current++,
            x: 50 + Math.cos(angle) * r,
            y: 50 + Math.sin(angle) * r,
            age: 0,
          });
        }
        return aged;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const circles = [25, 50, 75, 100];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0d2444 50%, #071322 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
        color: "#00ff88",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Radar */}
      <div
        style={{
          position: "relative",
          width: 280,
          height: 280,
          marginBottom: 32,
        }}
      >
        <svg width={280} height={280} style={{ position: "absolute", inset: 0 }}>
          {/* Circles */}
          {circles.map((r) => (
            <circle
              key={r}
              cx={140}
              cy={140}
              r={(r / 100) * 130}
              fill="none"
              stroke="rgba(0,255,136,0.2)"
              strokeWidth={1}
            />
          ))}
          {/* Crosshairs */}
          <line x1={140} y1={10} x2={140} y2={270} stroke="rgba(0,255,136,0.15)" strokeWidth={1} />
          <line x1={10} y1={140} x2={270} y2={140} stroke="rgba(0,255,136,0.15)" strokeWidth={1} />

          {/* Radar sweep */}
          <defs>
            <radialGradient id="sweepGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
              gradientTransform={`translate(140 140) scale(130)`}>
              <stop offset="0%" stopColor="rgba(0,255,136,0.6)" />
              <stop offset="100%" stopColor="rgba(0,255,136,0)" />
            </radialGradient>
          </defs>
          <g transform={`rotate(${scanAngle}, 140, 140)`}>
            <path
              d={`M 140 140 L ${140 + 130 * Math.cos(-0.3)} ${140 + 130 * Math.sin(-0.3)} A 130 130 0 0 1 ${140 + 130} 140 Z`}
              fill="url(#sweepGrad)"
              opacity={0.5}
            />
            <line x1={140} y1={140} x2={140 + 130} y2={140}
              stroke="rgba(0,255,136,0.9)" strokeWidth={2} />
          </g>

          {/* Blips */}
          {blips.map((b) => {
            const opacity = Math.max(0, 1 - b.age / 3000);
            const cx = (b.x / 100) * 260 + 10;
            const cy = (b.y / 100) * 260 + 10;
            return (
              <circle
                key={b.id}
                cx={cx}
                cy={cy}
                r={3}
                fill="#00ff88"
                opacity={opacity}
                style={{ filter: "drop-shadow(0 0 4px #00ff88)" }}
              />
            );
          })}

          {/* Center dot */}
          <circle cx={140} cy={140} r={4} fill="#00ff88"
            style={{ filter: "drop-shadow(0 0 8px #00ff88)" }} />
        </svg>

        {/* No signal marker */}
        <div
          style={{
            position: "absolute",
            top: "36%",
            left: "58%",
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid #ff4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "gpsBlip 1.4s ease-in-out infinite",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4444" }} />
        </div>
      </div>

      {/* Status text */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: "4px", color: "rgba(0,255,136,0.5)", marginBottom: 8 }}>
          ECOVISION FLEET GPS
        </div>
        <div
          style={{
            fontSize: "clamp(72px, 14vw, 120px)",
            fontWeight: 900,
            lineHeight: 1,
            color: "#00ff88",
            textShadow: "0 0 30px rgba(0,255,136,0.5), 0 0 60px rgba(0,255,136,0.2)",
            letterSpacing: "-4px",
          }}
        >
          404
        </div>
        <div style={{ fontSize: 14, letterSpacing: "6px", marginTop: 8, color: "rgba(0,255,136,0.7)" }}>
          SIGNAL LOST
          <span style={{ marginLeft: 4, color: "#00ff88" }}>
            {".".repeat(signalDots)}
            <span style={{ opacity: 0.2 }}>{".".repeat(3 - signalDots)}</span>
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "rgba(0,255,136,0.4)", letterSpacing: "2px" }}>
          TARGET COORDINATES NOT FOUND
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginBottom: 32,
          fontSize: 11,
          color: "rgba(0,255,136,0.4)",
          letterSpacing: "2px",
        }}
      >
        {["LAT: --.-°N", "LNG: --.-°E", "ALT: ???m"].map((s) => (
          <div key={s}>{s}</div>
        ))}
      </div>

      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 32px",
          border: "1px solid rgba(0,255,136,0.4)",
          color: "#00ff88",
          textDecoration: "none",
          fontSize: 12,
          letterSpacing: "4px",
          borderRadius: 4,
          background: "rgba(0,255,136,0.05)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,255,136,0.15)";
          (e.currentTarget as HTMLElement).style.borderColor = "#00ff88";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,136,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,255,136,0.05)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,136,0.4)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        ← RECALCULATE ROUTE
      </Link>

      <style>{`
        @keyframes gpsBlip {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

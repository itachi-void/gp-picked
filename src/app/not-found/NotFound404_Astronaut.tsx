import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 0.5 + Math.random() * 2,
  opacity: 0.3 + Math.random() * 0.7,
  twinkleDelay: Math.random() * 4,
}));

export default function NotFound404_Astronaut() {
  const [floatPhase, setFloatPhase] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      setFloatPhase(((t - start) / 1000) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const floatY = Math.sin(floatPhase * 0.5) * 16;
  const floatRotate = Math.sin(floatPhase * 0.3) * 6;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 30% 20%, #1a0533 0%, #0d0221 50%, #000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Stars */}
      {STARS.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: s.opacity,
            animation: `twinkle 3s ${s.twinkleDelay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Nebula glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(100,20,180,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "8%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,80,180,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Astronaut */}
      <div
        style={{
          transform: `translateY(${floatY}px) rotate(${floatRotate}deg)`,
          transition: "transform 0.1s linear",
          marginBottom: 16,
          userSelect: "none",
          position: "relative",
        }}
      >
        <svg width={180} height={220} viewBox="0 0 180 220">
          {/* Tether */}
          <path
            d="M 90 200 Q 140 160 160 80"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />

          {/* Backpack */}
          <rect x={56} y={110} width={68} height={55} rx={10}
            fill="#4a5568" stroke="#718096" strokeWidth={1.5} />
          <rect x={64} y={118} width={20} height={14} rx={4}
            fill="#2d3748" />
          <rect x={96} y={118} width={20} height={14} rx={4}
            fill="#2d3748" />

          {/* Body suit */}
          <rect x={52} y={100} width={76} height={65} rx={14}
            fill="#e2e8f0" stroke="#cbd5e0" strokeWidth={2} />

          {/* Chest detail */}
          <rect x={64} y={110} width={52} height={28} rx={6}
            fill="#bee3f8" stroke="#90cdf4" strokeWidth={1} />
          <text x={90} y={129} textAnchor="middle" fontSize={10}
            fill="#2b6cb0" fontWeight="bold" fontFamily="monospace">404</text>

          {/* Arms */}
          <ellipse cx={38} cy={120} rx={12} ry={28} fill="#e2e8f0"
            stroke="#cbd5e0" strokeWidth={2}
            transform="rotate(-15, 38, 120)" />
          <ellipse cx={142} cy={120} rx={12} ry={28} fill="#e2e8f0"
            stroke="#cbd5e0" strokeWidth={2}
            transform="rotate(15, 142, 120)" />

          {/* Gloves */}
          <ellipse cx={32} cy={144} rx={11} ry={9} fill="#a0aec0" />
          <ellipse cx={148} cy={144} rx={11} ry={9} fill="#a0aec0" />

          {/* Legs */}
          <rect x={62} y={158} width={22} height={40} rx={8}
            fill="#e2e8f0" stroke="#cbd5e0" strokeWidth={2} />
          <rect x={96} y={158} width={22} height={40} rx={8}
            fill="#e2e8f0" stroke="#cbd5e0" strokeWidth={2} />

          {/* Boots */}
          <ellipse cx={73} cy={200} rx={16} ry={8} fill="#718096" />
          <ellipse cx={107} cy={200} rx={16} ry={8} fill="#718096" />

          {/* Helmet */}
          <circle cx={90} cy={78} r={46} fill="#e2e8f0"
            stroke="#cbd5e0" strokeWidth={3} />
          {/* Visor */}
          <ellipse cx={90} cy={82} rx={32} ry={28}
            fill="rgba(20,30,80,0.85)"
            stroke="#90cdf4" strokeWidth={2} />
          {/* Visor reflection */}
          <ellipse cx={76} cy={70} rx={9} ry={6}
            fill="rgba(255,255,255,0.15)"
            transform="rotate(-20, 76, 70)" />
          {/* Inside visor - lost expression */}
          <circle cx={82} cy={82} r={4} fill="#ffd700" />
          <circle cx={98} cy={82} r={4} fill="#ffd700" />
          <path d="M 80 94 Q 90 89 100 94" fill="none"
            stroke="#ffd700" strokeWidth={2} strokeLinecap="round" />

          {/* Helmet light */}
          <circle cx={90} cy={40} r={6} fill="#ffd700"
            style={{ filter: "drop-shadow(0 0 8px #ffd700)" }} />
        </svg>

        {/* Speech bubble */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: -130,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px 12px 12px 2px",
            padding: "8px 14px",
            fontSize: 12,
            color: "rgba(255,255,255,0.85)",
            whiteSpace: "nowrap",
            lineHeight: 1.5,
          }}
        >
          Houston...<br />we have a 404
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontSize: "clamp(80px, 14vw, 120px)",
            fontWeight: 900,
            lineHeight: 1,
            color: "#fff",
            textShadow: "0 0 40px rgba(180,100,255,0.6), 0 0 80px rgba(100,50,200,0.3)",
            letterSpacing: "-4px",
          }}
        >
          404
        </div>
        <div
          style={{
            fontSize: "clamp(15px, 2vw, 20px)",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "6px",
            marginTop: 6,
          }}
        >
          PAGE NOT FOUND IN SPACE
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.7,
          }}
        >
          الصفحة ضاعت في الفضاء الرقمي<br />بلا إشارة، بلا إنترنت، بلا أمل... تقريباً
        </div>
      </div>

      {/* Distance counter */}
      <div
        style={{
          margin: "24px 0",
          padding: "12px 28px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "2px",
        }}
      >
        DISTANCE FROM HOME: <span style={{ color: "#a78bfa" }}>∞ km</span>
      </div>

      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 36px",
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 50,
          boxShadow: "0 6px 24px rgba(124,58,237,0.4)",
          letterSpacing: "1px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(124,58,237,0.6)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "none";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(124,58,237,0.4)";
        }}
      >
        🚀 العودة لأرض الواقع
      </Link>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
}

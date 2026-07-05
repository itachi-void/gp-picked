import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  emoji: ["📦", "🗑️", "♻️", "📄", "🔧", "⚙️", "🚛", "📊"][i % 8],
  x: 5 + Math.random() * 90,
  delay: Math.random() * 4,
  duration: 4 + Math.random() * 4,
  size: 16 + Math.random() * 22,
}));

export default function NotFound404_Recycling() {
  const [lidAngle, setLidAngle] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [particles, setParticles] = useState<{ id: number; active: boolean }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const throwIn = () => {
    setIsOpen(true);
    setLidAngle(-40);
    setTimeout(() => {
      setLidAngle(-15);
      setTimeout(() => {
        setIsOpen(false);
        setLidAngle(0);
      }, 400);
    }, 500);
    setParticles((p) => [...p, { id: Date.now(), active: true }]);
  };

  useEffect(() => {
    const t = setInterval(throwIn, 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Floating particles background */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: "-10%",
            fontSize: p.size,
            animation: `floatUp ${p.duration}s ${p.delay}s ease-in infinite`,
            pointerEvents: "none",
            opacity: 0.15,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Main scene */}
      <div style={{ position: "relative", marginBottom: 8, userSelect: "none" }}>
        {/* Flying items above bin */}
        <div
          style={{
            position: "absolute",
            top: -90,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 12,
            animation: "flyItems 2.8s ease-in-out infinite",
          }}
        >
          {["🗺️", "❓", "📍"].map((e, i) => (
            <div
              key={i}
              style={{
                fontSize: 28,
                animation: `wobble ${0.5 + i * 0.15}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {e}
            </div>
          ))}
        </div>

        {/* Recycling bin SVG */}
        <svg width={180} height={200} viewBox="0 0 180 200">
          {/* Bin body */}
          <rect x={30} y={70} width={120} height={120} rx={12} fill="#4caf50" />
          <rect x={30} y={70} width={120} height={120} rx={12} fill="url(#binGrad)" />
          <defs>
            <linearGradient id="binGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
          </defs>

          {/* Recycling symbol */}
          <text
            x={90}
            y={145}
            textAnchor="middle"
            fontSize={52}
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
          >
            ♻️
          </text>

          {/* Bin top rim */}
          <rect x={20} y={62} width={140} height={18} rx={8} fill="#388e3c" />

          {/* Lid */}
          <g transform={`rotate(${lidAngle}, 90, 62)`}>
            <rect x={15} y={45} width={150} height={20} rx={8} fill="#2e7d32" />
            <rect x={68} y={28} width={44} height={22} rx={6} fill="#388e3c" />
          </g>
        </svg>
      </div>

      {/* 404 text */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <div
          style={{
            fontSize: "clamp(80px, 16vw, 130px)",
            fontWeight: 900,
            lineHeight: 1,
            color: "#2e7d32",
            textShadow: "0 4px 0 rgba(0,0,0,0.1), 0 8px 20px rgba(46,125,50,0.2)",
            letterSpacing: "-4px",
          }}
        >
          404
        </div>
        <div
          style={{
            fontSize: "clamp(16px, 2.5vw, 22px)",
            fontWeight: 700,
            color: "#388e3c",
            marginTop: 4,
            letterSpacing: "2px",
          }}
        >
          PAGE RECYCLED
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: "clamp(13px, 1.5vw, 16px)",
            color: "#558b2f",
            maxWidth: 340,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          هذه الصفحة تم إعادة تدويرها.<br />ساعدنا في الحفاظ على البيئة الرقمية!
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 24,
          margin: "24px 0",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { icon: "🌱", label: "CO₂ موفر", value: "2.4 kg" },
          { icon: "💧", label: "ماء محفوظ", value: "12 L" },
          { icon: "⚡", label: "طاقة منقذة", value: "0.8 kWh" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(8px)",
              borderRadius: 12,
              padding: "12px 20px",
              textAlign: "center",
              border: "1px solid rgba(76,175,80,0.3)",
              boxShadow: "0 4px 12px rgba(46,125,50,0.1)",
            }}
          >
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2e7d32" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#558b2f" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 36px",
          background: "linear-gradient(135deg, #4caf50, #2e7d32)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 15,
          fontWeight: 600,
          borderRadius: 50,
          boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
          transition: "all 0.2s",
          letterSpacing: "1px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.03)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(46,125,50,0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "none";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(46,125,50,0.35)";
        }}
      >
        ♻️ العودة للصفحة الرئيسية
      </Link>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
          50% { opacity: 0.25; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes flyItems {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-14px); }
        }
        @keyframes wobble {
          from { transform: rotate(-12deg); }
          to   { transform: rotate(12deg); }
        }
      `}</style>
    </div>
  );
}

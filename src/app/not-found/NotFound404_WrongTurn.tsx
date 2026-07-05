import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const ROAD_SIGNS = [
  { text: "EcoVision HQ", arrow: "←", dist: "0 km", color: "#22c55e" },
  { text: "الصفحة المطلوبة", arrow: "?", dist: "∞ km", color: "#ef4444" },
  { text: "الرجوع للأمان", arrow: "↑", dist: "1 click", color: "#3b82f6" },
];

export default function NotFound404_WrongTurn() {
  const carXRef = useRef(-15);
  const carDirRef = useRef(1);
  const [carRender, setCarRender] = useState({ x: -15, flipped: false });
  const rafRef = useRef<number>(0);
  const prevT = useRef(0);

  useEffect(() => {
    const tick = (t: number) => {
      const dt = Math.min((t - (prevT.current || t)) / 1000, 0.1);
      prevT.current = t;
      carXRef.current += carDirRef.current * dt * 18;
      if (carXRef.current > 115) carDirRef.current = -1;
      if (carXRef.current < -15) carDirRef.current = 1;
      setCarRender({ x: carXRef.current, flipped: carDirRef.current < 0 });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #87ceeb 0%, #b0e0ff 35%, #d4f5b0 36%, #5a8c3d 37%, #4a7a30 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Clouds */}
      {[
        { x: "5%", y: "6%", scale: 1 },
        { x: "65%", y: "3%", scale: 0.7 },
        { x: "40%", y: "8%", scale: 0.85 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.x,
            top: c.y,
            transform: `scale(${c.scale})`,
            animation: `cloudFloat ${8 + i * 3}s ease-in-out infinite alternate`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 40,
              borderRadius: 50,
              background: "rgba(255,255,255,0.85)",
              position: "relative",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{
              position: "absolute",
              top: -18,
              left: 18,
              width: 56,
              height: 40,
              borderRadius: 50,
              background: "rgba(255,255,255,0.85)",
            }} />
          </div>
        </div>
      ))}

      {/* Sun */}
      <div
        style={{
          position: "absolute",
          top: "4%",
          right: "8%",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ffd700, #ff8c00)",
          boxShadow: "0 0 30px rgba(255,215,0,0.6)",
        }}
      />

      {/* Trees */}
      {[8, 16, 78, 86, 92].map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "12%",
            left: `${x}%`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${0.6 + (i % 3) * 0.25})`,
          }}
        >
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderBottom: "35px solid #2d6a1f",
          }} />
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "28px solid transparent",
            borderRight: "28px solid transparent",
            borderBottom: "42px solid #388e3c",
            marginTop: -15,
          }} />
          <div style={{ width: 10, height: 20, background: "#795548" }} />
        </div>
      ))}

      {/* Road */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "14%",
          background: "#555",
        }}
      >
        {/* Lane markings */}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: `${(i / 12) * 100 + 2}%`,
              width: "6%",
              height: 4,
              background: "#fff",
              borderRadius: 2,
              transform: "translateY(-50%)",
              opacity: 0.6,
            }}
          />
        ))}

        {/* Car */}
        <div
          style={{
            position: "absolute",
            bottom: "60%",
            left: `${carRender.x}%`,
            transform: carRender.flipped ? "scaleX(-1)" : "none",
          }}
        >
          <svg width={70} height={38} viewBox="0 0 70 38">
            {/* Car body */}
            <rect x={5} y={16} width={60} height={18} rx={4} fill="#e53e3e" />
            {/* Roof */}
            <path d="M 18 16 Q 22 5 35 4 Q 48 5 52 16 Z" fill="#c53030" />
            {/* Windows */}
            <path d="M 22 16 Q 25 8 34 7 L 34 16 Z" fill="#bee3f8" opacity={0.8} />
            <path d="M 36 7 Q 45 8 48 16 L 36 16 Z" fill="#bee3f8" opacity={0.8} />
            {/* Wheels */}
            <circle cx={16} cy={34} r={6} fill="#222" />
            <circle cx={54} cy={34} r={6} fill="#222" />
            <circle cx={16} cy={34} r={3} fill="#888" />
            <circle cx={54} cy={34} r={3} fill="#888" />
            {/* Headlights */}
            <rect x={60} y={20} width={7} height={5} rx={2} fill="#ffd700" opacity={0.9} />
            {/* EcoVision logo on car */}
            <text x={35} y={28} textAnchor="middle" fontSize={7} fill="#fff" fontWeight="bold">ECO</text>
          </svg>
        </div>
      </div>

      {/* 404 Sign */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Sign post */}
        <div
          style={{
            background: "#f59e0b",
            border: "4px solid #d97706",
            borderRadius: 8,
            padding: "16px 40px",
            textAlign: "center",
            boxShadow: "4px 6px 0 rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          <div style={{ fontSize: "clamp(60px, 12vw, 100px)", fontWeight: 900, color: "#000", lineHeight: 1 }}>
            404
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#000", letterSpacing: "3px", marginTop: 4 }}>
            WRONG TURN
          </div>
        </div>
        <div style={{ width: 12, height: 60, background: "#8b5e3c" }} />
      </div>

      {/* Direction signs */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
          justifyContent: "center",
          position: "relative",
          zIndex: 5,
        }}
      >
        {ROAD_SIGNS.map((s) => (
          <div
            key={s.text}
            style={{
              background: s.color,
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              boxShadow: "3px 4px 0 rgba(0,0,0,0.2)",
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 20 }}>{s.arrow}</div>
            <div>{s.text}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{s.dist}</div>
          </div>
        ))}
      </div>

      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 36px",
          background: "#1a6b3c",
          color: "#fff",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 700,
          borderRadius: 8,
          boxShadow: "4px 6px 0 rgba(0,0,0,0.25)",
          letterSpacing: "1px",
          transition: "all 0.15s",
          position: "relative",
          zIndex: 5,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "4px 8px 0 rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "none";
          (e.currentTarget as HTMLElement).style.boxShadow = "4px 6px 0 rgba(0,0,0,0.25)";
        }}
      >
        🗺️ العودة للطريق الصح
      </Link>

      <style>{`
        @keyframes cloudFloat {
          from { transform: translateX(0); }
          to { transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}

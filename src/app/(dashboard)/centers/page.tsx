"use client";  // بنقول للمتصفح: شغلني عندي، مش على السيرفر

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { useQuery, useQueries } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Zap,          // أيقونة برق
  Thermometer,  // أيقونة حرارة
  Fuel,         // أيقونة وقود
  Container,    // أيقونة حاوية
  BarChart3,    // أيقونة رسم بياني
  Wifi,         // أيقونة واي فاي
  Activity,     // أيقونة نشاط
  ArrowUpRight, // أيقونة سهم
  Building2,    // أيقونة مبنى
  Recycle,      // أيقونة إعادة تدوير
  Truck,        // أيقونة شاحنة
  Package,      // أيقونة صندوق
  MapPin,       // أيقونة علامة خريطة
} from "lucide-react";  // مكتبة الأيقونات

// ========== شكل بيانات المركز الواحد ==========
interface CenterNode {
  id: string;           // رقم المركز: "C1", "C2", ...
  name: string;         // اسم المركز بالإنجليزي
  nameAr: string;       // اسم المركز بالعربي
  type:                 // نوع المركز:
    | "collection"      //   - تجميع
    | "sorting"         //   - فرز
    | "processing"      //   - معالجة
    | "distribution";   //   - توزيع
  status:               // حالة المركز:
    | "online"          //   - شغال
    | "maintenance"     //   - صيانة
    | "offline";        //   - قافل
  x: number;            // الموقع الأفقي على الخريطة (نسبة مئوية)
  y: number;            // الموقع الرأسي على الخريطة (نسبة مئوية)
  capacity: number;     // السعة المستخدمة (%)
  throughput: number;   // عدد الزجاجات اللي بتعدي في الساعة
  efficiency: number;   // الكفاءة (%)
  co2Saved: number;     // كمية ثاني أكسيد الكربون اللي تم توفيره (كجم)
  temperature: number;  // درجة الحرارة (مئوية)
  activeDrivers: number;// عدد السواقين النشطين
}

// ========== بيانات المراكز الخمسة ==========

// النتيجة: شبكة متصلة، كل المراكز مرتبطة ببعض

// ========== تنسيقات كل نوع مركز ==========
const TYPE_CONFIG: Record<
  CenterNode["type"],  // المفتاح: نوع المركز
  {
    gradient: string;         // تدرج لوني للأيقونة
    icon: React.ComponentType<any>;  // الأيقونة
    label: string;           // التسمية
    glow: string;            // لون التوهج في الوضع الداكن
    glowLight: string;       // لون التوهج في الوضع الفاتح
    accent: string;          // اللون الأساسي
    lightWall: string;       // لون الحائط في الوضع الفاتح
    lightWallRight: string;  // لون الحائط اليمين في الوضع الفاتح
    lightTop: string;        // لون السقف في الوضع الفاتح
    darkWall: string;        // لون الحائط في الوضع الداكن
    darkWallRight: string;   // لون الحائط اليمين في الوضع الداكن
    darkTop: string;         // لون السقف في الوضع الداكن
  }
> = {
  collection: {                    // مراكز التجميع
    gradient: "from-cyan-500 to-blue-600",  // تدرج سماوي → أزرق
    icon: Package,                 // أيقونة صندوق
    label: "Collection",          // التسمية
    glow: "rgba(0,229,255,0.45)", // توهج سماوي شفاف
    glowLight: "rgba(6,182,212,0.25)", // توهج فاتح
    accent: "#0891B2",            // اللون الأساسي
    lightWall: "#E0F2FE",         // حائط فاتح
    lightWallRight: "#F0F9FF",    // حائط يمين فاتح
    lightTop: "#F8FCFF",          // سقف فاتح
    darkWall: "#0B1E29",          // حائط داكن
    darkWallRight: "#0F2D3E",     // حائط يمين داكن
    darkTop: "#173C52",           // سقف داكن
  },
  sorting: {                       // مراكز الفرز
    gradient: "from-violet-500 to-purple-600", // تدرج بنفسجي
    icon: Recycle,                 // أيقونة إعادة تدوير
    label: "Sorting",
    glow: "rgba(139,92,246,0.45)",
    glowLight: "rgba(139,92,246,0.25)",
    accent: "#7C3AED",
    lightWall: "#F3E8FF",
    lightWallRight: "#FAF5FF",
    lightTop: "#FDFBFF",
    darkWall: "#1A0F2E",
    darkWallRight: "#251442",
    darkTop: "#331C5A",
  },
  processing: {                    // مراكز المعالجة
    gradient: "from-amber-500 to-orange-600", // تدرج كهرماني
    icon: Building2,               // أيقونة مبنى
    label: "Processing",
    glow: "rgba(245,158,11,0.45)",
    glowLight: "rgba(245,158,11,0.25)",
    accent: "#D97706",
    lightWall: "#FEF3C7",
    lightWallRight: "#FFFDF5",
    lightTop: "#FFFFFD",
    darkWall: "#2A1B05",
    darkWallRight: "#3B2607",
    darkTop: "#4D330A",
  },
  distribution: {                  // مراكز التوزيع
    gradient: "from-emerald-500 to-green-600", // تدرج زمردي
    icon: Truck,                   // أيقونة شاحنة
    label: "Distribution",
    glow: "rgba(16,185,129,0.45)",
    glowLight: "rgba(16,185,129,0.25)",
    accent: "#059669",
    lightWall: "#D1FAE5",
    lightWallRight: "#F0FDF4",
    lightTop: "#F8FEFA",
    darkWall: "#052214",
    darkWallRight: "#0A331E",
    darkTop: "#11462B",
  },
};

// ========== ألوان الحالة ==========
const STATUS_COLORS: Record<
  string,
  { dot: string; label: string }  // dot = لون النقطة، label = التسمية
> = {
  online: { 
    dot: "bg-emerald-500",   // أخضر
    label: "Online"          // شغال
  },
  maintenance: { 
    dot: "bg-amber-500",     // أصفر
    label: "Maintenance"     // صيانة
  },
  offline: { 
    dot: "bg-red-500",       // أحمر
    label: "Offline"         // قافل
  },
};
/* ────────────────────────────────────────────
   IsometricBuilding — SVG isometric building
   ──────────────────────────────────────────── */
// ========== مكون المبنى الثلاثي الأبعاد ==========


function IsometricBuilding({
  center,    // بيانات المركز
  isActive,  // هل المركز ده هو النشط؟
  isDark,    // هل الوضع الداكن شغال؟
  onClick,   // دالة الضغط على المركز
}: {
  center: CenterNode;
  isActive: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  // نجيب التنسيقات بتاعة نوع المركز ده
  const config = TYPE_CONFIG[center.type];

  // ========== ألوان المبنى حسب الحالة ==========
  
  // لون القاعدة
  const baseFill = isDark ? "#0D1117" : "#E2E8F0";
  // لو داكن: أسود تقريباً، لو فاتح: رمادي فاتح

  // لون الحائط الشمال (يظهر لما المركز نشط أو حسب الوضع)
  const leftWall = isActive
    ? config.accent                      // لو نشط: اللون الأساسي
    : isDark
      ? config.darkWall                  // لو داكن: الحائط الداكن
      : config.lightWall;                // لو فاتح: الحائط الفاتح

  // لون الحائط اليمين
  const rightWall = isActive
    ? isDark
      ? config.darkWallRight             // نشط + داكن
      : config.lightWallRight            // نشط + فاتح
    : isDark
      ? config.darkWallRight             // مش نشط + داكن
      : config.lightWallRight;           // مش نشط + فاتح

  // لون السقف
  const topFace = isActive
    ? isDark
      ? "#FFFFFF"                        // نشط + داكن: أبيض (عشان يبرز)
      : config.accent                    // نشط + فاتح: اللون الأساسي
    : isDark
      ? config.darkTop                   // مش نشط + داكن
      : config.lightTop;                 // مش نشط + فاتح

  // لون الحدود
  const activeStroke = config.accent;     // لما المركز نشط
  const inactiveStroke = isDark
    ? "rgba(255,255,255,0.12)"           // مش نشط + داكن: أبيض شفاف
    : "rgba(0,0,0,0.08)";                // مش نشط + فاتح: أسود شفاف
  const inactiveStrokeWall = isDark
    ? "rgba(255,255,255,0.08)"           // حدود الحوائط في الوضع الداكن
    : "rgba(0,0,0,0.05)";                // حدود الحوائط في الوضع الفاتح

  // لون النص (اسم المركز)
  const labelColor = isActive
    ? isDark
      ? "#00E5FF"                        // نشط + داكن: سماوي
      : config.accent                    // نشط + فاتح: اللون الأساسي
    : isDark
      ? "rgba(255,255,255,0.75)"         // مش نشط + داكن: أبيض شفاف
      : "#334155";                       // مش نشط + فاتح: رمادي

  // لون نص السعة
  const capacityColor = isActive
    ? isDark
      ? "rgba(0,229,255,0.85)"           // نشط + داكن: سماوي شفاف
      : "rgba(8,145,178,0.85)"           // نشط + فاتح: أزرق شفاف
    : isDark
      ? "rgba(255,255,255,0.4)"          // مش نشط + داكن: أبيض شفاف
      : "#64748B";                       // مش نشط + فاتح: رمادي

  const statusStroke = isDark ? "#0F1215" : "#FFFFFF";  // حدود دايرة الحالة
  const glowColor = isDark ? config.glow : config.glowLight;  // لون التوهج

  // لون الشبابيك
  const windowFill = isActive
    ? isDark
      ? "#00E5FF"                        // نشط + داكن: سماوي
      : "#FFFFFF"                        // نشط + فاتح: أبيض
    : center.status === "online"
      ? isDark
        ? "#00E5FF"                      // شغال + داكن: سماوي
        : config.accent                  // شغال + فاتح: اللون الأساسي
      : center.status === "maintenance"
        ? "#F59E0B"                      // صيانة: أصفر
        : "#EF4444";                     // قافل: أحمر

  // ========== رسم المبنى ==========
  return (
    <g  // g = group في SVG، زي div في HTML
      style={{ 
        cursor: "pointer",              // المؤشر يبقى إيد
        transition: "transform 0.2s ease"  // الحركة سلسة
      }}
      onClick={onClick}  // لما المستخدم يضغط
      onMouseEnter={(e) => {
        // لما الماوس يدخل: كبر ٨٪
        (e.currentTarget as SVGGElement).style.transform = "scale(1.08)";
        (e.currentTarget as SVGGElement).style.transformOrigin = "center";
      }}
      onMouseLeave={(e) => {
        // لما الماوس يخرج: رجع للحجم الطبيعي
        (e.currentTarget as SVGGElement).style.transform = "scale(1)";
      }}
    >
      {/* ===== توهج تحت المبنى ===== */}
      <ellipse  // شكل بيضاوي
        cx={0}  // المركز الأفقي
        cy={42} // المركز الرأسي (تحت المبنى)
        rx={isActive ? 38 : 30}  // نصف القطر الأفقي (أكبر لو نشط)
        ry={isActive ? 16 : 12}  // نصف القطر الرأسي (أكبر لو نشط)
        fill={glowColor}         // لون التوهج
        opacity={isActive ? 0.6 : 0.25}  // الشفافية
      >
        {/* حركة نبض للتوهج */}
        <animate
          attributeName="opacity"           // بنحرك الشفافية
          values={isActive ? "0.6;0.3;0.6" : "0.25;0.15;0.25"}  // القيم
          dur="3s"                          // المدة: ٣ ثواني
          repeatCount="indefinite"          // تكرار للأبد
        />
      </ellipse>

      {/* ===== القاعدة (الوجه السفلي) ===== */}
      <polygon  // شكل متعدد الأضلاع (٤ نقاط)
        points="0,40 -28,26 0,12 28,26"  // النقاط الأربعة
        fill={baseFill}                   // لون التعبئة
        stroke={isActive ? activeStroke : inactiveStroke}  // لون الحدود
        strokeWidth={isActive ? 1.5 : 0.5}  // سمك الحدود
      />

      {/* ===== الحائط الشمال (الوجه الأيسر) ===== */}
      <polygon
        points="-28,26 -28,-14 0,-28 0,12"  // شبه منحرف
        fill={leftWall}
        stroke={isActive ? activeStroke : inactiveStrokeWall}
        strokeWidth={isActive ? 1 : 0.3}
      />

      {/* ===== الحائط اليمين ===== */}
      <polygon
        points="28,26 28,-14 0,-28 0,12"  // شبه منحرف معكوس
        fill={rightWall}
        stroke={isActive ? activeStroke : inactiveStrokeWall}
        strokeWidth={isActive ? 1 : 0.3}
      />

      {/* ===== السقف (الوجه العلوي) ===== */}
      <polygon
        points="0,-28 -28,-14 0,0 28,-14"  // معين
        fill={isActive && isDark ? activeStroke : topFace}
        opacity={isActive ? 0.95 : 0.8}
        stroke={isActive ? activeStroke : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}
        strokeWidth={isActive ? 1.5 : 0.5}
      />

      {/* ===== الشبابيك على الحائط الشمال ===== */}
      {[0, 1, 2].map((row) =>    // ٣ صفوف
        [0, 1].map((col) => {    // عمودين في كل صف
          // حساب الشفافية بناءً على رقم المركز + الصف + العمود
          const opacitySeed = (center.id.charCodeAt(0) + row * 10 + col) % 5;
          const opacity = isActive
            ? 0.95
            : isDark
              ? 0.4 + opacitySeed * 0.08
              : 0.6 + opacitySeed * 0.08;
          return (
            <rect  // مستطيل (الشباك)
              key={`w-${row}-${col}`}
              x={-24 + col * 12 + row * 4}   // الموقع الأفقي
              y={-8 + row * 12 - col * 6}    // الموقع الرأسي
              width={4}                       // العرض
              height={5}                      // الطول
              fill={windowFill}               // اللون
              opacity={opacity}               // الشفافية
              rx={0.5}                        // تدوير الزوايا
              transform={`skewY(-30)`}        // ميلان بزاوية ٣٠ درجة
            />
          );
        })
      )}

      {/* ===== دايرة الحالة (فوق المبنى) ===== */}
      <circle  // دايرة
        cx={0}     // المركز الأفقي
        cy={-36}   // المركز الرأسي (فوق)
        r={isActive ? 7 : 5}  // نصف القطر
        fill={
          center.status === "online"
            ? "#10B981"        // أخضر لو شغال
            : center.status === "maintenance"
              ? "#F59E0B"      // أصفر لو صيانة
              : "#EF4444"      // أحمر لو قافل
        }
        stroke={statusStroke}  // لون الحدود
        strokeWidth={2}        // سمك الحدود
      >
        {/* لو المركز شغال: نبض في الدايرة */}
        {center.status === "online" && (
          <animate
            attributeName="r"                        // بنحرك نصف القطر
            values={isActive ? "7;9;7" : "5;6;5"}   // يكبر ويصغر
            dur="2s"                                 // كل ثانيتين
            repeatCount="indefinite"                 // تكرار للأبد
          />
        )}
      </circle>

      {/* ===== اسم المركز ===== */}
      <text  // نص في SVG
        x={0}                // الموقع الأفقي (نص المركز)
        y={58}               // الموقع الرأسي (تحت المبنى)
        textAnchor="middle"  // النص متوازي في النص
        fill={labelColor}    // لون النص
        fontSize={isActive ? 9.5 : 8}  // حجم الخط
        fontWeight={isActive ? 850 : 600}  // سمك الخط
        fontFamily="system-ui, -apple-system, sans-serif"  // نوع الخط
        letterSpacing="0.5"  // تباعد الحروف
      >
        {center.name}  {/* اسم المركز */}
      </text>

      {/* ===== نسبة السعة ===== */}
      <text
        x={0}
        y={70}
        textAnchor="middle"
        fill={capacityColor}
        fontSize={7}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {center.capacity}% Capacity  {/* مثال: 87% Capacity */}
      </text>
    </g>
  );
}

/* ────────────────────────────────────────────
   ConnectionLine — Animated data flow line
   ──────────────────────────────────────────── */
// ========== خط التوصيل بين مركزين ==========
function ConnectionLine({
  x1, y1,    // إحداثيات المركز الأول
  x2, y2,    // إحداثيات المركز الثاني
  isActive,  // هل الخط نشط (أحد المركزين متصلين به هو النشط)؟
  isDark,    // هل الوضع الداكن شغال؟
  index,     // رقم الخط (عشان الحركة تكون مختلفة لكل خط)
}: {
  x1: number; y1: number;
  x2: number; y2: number;
  isActive: boolean;
  isDark: boolean;
  index: number;
}) {
  // معرف فريد للتدرج اللوني (عشان كل خط ليه تدرجه الخاص)
  const gradientId = `flow-gradient-${index}`;
  
  // لون الخط الأساسي
  const lineColor = isDark ? "#00E5FF" : "#0891B2";
  // لو داكن: سماوي، لو فاتح: أزرق

  // ===== حساب نقطة المنتصف للخط المنحني =====
  const mx = (x1 + x2) / 2;        // المنتصف الأفقي
  const my = (y1 + y2) / 2 - 15;   // المنتصف الرأسي (مرفوع ١٥ بكسل عشان المنحنى)
  
  // صيغة المسار: M = تحرك لـ، Q = منحنى تربيعي
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  // M x1,y1 = ابدأ من النقطة الأولى
  // Q mx,my x2,y2 = ارسم منحنى يمر بنقطة التحكم mx,my وينتهي عند x2,y2

  return (
    <g>  // مجموعة SVG
      {/* ===== تعريف التدرج اللوني ===== */}
      <defs>  // تعريفات SVG (أنماط، تدرجات، فلاتر)
        <linearGradient  // تدرج خطي
          id={gradientId}  // المعرف الفريد
          x1="0%" y1="0%"  // نقطة البداية (أعلى اليسار)
          x2="100%" y2="0%" // نقطة النهاية (أعلى اليمين)
        >
          {/* بداية التدرج: شفاف جداً */}
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.1} />
          
          {/* منتصف التدرج: اللون واضح */}
          <stop 
            offset="50%" 
            stopColor={lineColor} 
            stopOpacity={isActive ? 0.8 : 0.3}  // أوضح لو نشط
          />
          
          {/* نهاية التدرج: شفاف جداً */}
          <stop offset="100%" stopColor={lineColor} stopOpacity={0.1} />
        </linearGradient>
      </defs>

      {/* ===== الخط الأساسي (الخلفية) ===== */}
      <path  // مسار
        d={d}  // صيغة المسار اللي حسبناها
        fill="none"  // بدون تعبئة
        stroke={isDark ? "rgba(0,229,255,0.08)" : "rgba(8,145,178,0.1)"}
        // لون الخط: سماوي شفاف في الداكن، أزرق شفاف في الفاتح
        strokeWidth={isActive ? 2 : 1}  // سمك الخط
        strokeDasharray="6,4"  // خط متقطع: ٦ بكسل مرسوم، ٤ بكسل فاضي
      />

      {/* ===== الخط المتوهج (فوق الأساسي) ===== */}
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}  // استخدام التدرج اللي عرفناه
        strokeWidth={isActive ? 2.5 : 1.5}
        strokeLinecap="round"  // نهايات دائرية
      />

      {/* ===== حزمة البيانات الأولى (دايرة بتتحرك على الخط) ===== */}
      <circle  // دايرة
        r={isActive ? 3 : 2}  // نصف القطر
        fill={lineColor}       // اللون
        opacity={0.9}          // شفافية ٩٠٪
      >
        {/* حركة على طول المسار */}
        <animateMotion
          dur={`${2.5 + index * 0.4}s`}  // المدة: ٢.٥ ثانية + ٠.٤ × رقم الخط
          repeatCount="indefinite"        // تكرار للأبد
          path={d}                        // المسار اللي هتتحرك عليه
        />
        {/* نبض في الشفافية */}
        <animate
          attributeName="opacity"          // بنحرك الشفافية
          values="0.3;1;0.3"              // شفاف → واضح → شفاف
          dur={`${2.5 + index * 0.4}s`}   // نفس مدة الحركة
          repeatCount="indefinite"
        />
      </circle>

      {/* ===== حزمة البيانات الثانية (دايرة أصغر، بتتحرك بسرعة مختلفة) ===== */}
      <circle
        r={isActive ? 2 : 1.5}  // أصغر من الأولى
        fill={lineColor}
        opacity={0.5}            // شفافية ٥٠٪
      >
        <animateMotion
          dur={`${3 + index * 0.3}s`}     // أبطأ شوية
          repeatCount="indefinite"
          path={d}
          begin={`${1.2 + index * 0.2}s`}  // تبدأ بعد ١.٢ ثانية + تأخير
        />
      </circle>
    </g>
  );
}

/* ────────────────────────────────────────────
   TelemetrySidebar — Detailed stats for active node
   ──────────────────────────────────────────── */
// ========== لوحة المعلومات الجانبية ==========
function TelemetrySidebar({
  center,   // المركز المحدد
  isDark,   // هل الوضع الداكن؟
}: {
  center: CenterNode;
  isDark: boolean;
}) {
  // نجيب تنسيقات النوع والحالة
  const config = TYPE_CONFIG[center.type];
  const statusConfig = STATUS_COLORS[center.status];

  // ===== المقاييس اللي هتظهر =====
  const metrics = [
    {
      icon: BarChart3,     // أيقونة الرسم البياني
      label: "Throughput", // التسمية
      value: `${center.throughput}`,  // القيمة (من بيانات المركز)
      unit: "btl/hr",      // الوحدة: زجاجة/ساعة
      color: isDark ? "text-[#00E5FF]" : "text-[#0891B2]",  // اللون حسب الوضع
    },
    {
      icon: Activity,
      label: "Efficiency",
      value: `${center.efficiency}%`,
      unit: "",
      color: "text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: Thermometer,
      label: "Temperature",
      value: `${center.temperature}°C`,
      unit: "",
      color: center.temperature > 30
        ? "text-amber-500 dark:text-amber-400"  // أحمر لو الحرارة > ٣٠
        : "text-blue-500 dark:text-blue-400",   // أزرق لو الحرارة ≤ ٣٠
    },
    {
      icon: Container,
      label: "Capacity",
      value: `${center.capacity}%`,
      unit: "",
      color: center.capacity > 80
        ? "text-amber-500 dark:text-amber-400"  // أصفر لو السعة > ٨٠٪
        : "text-emerald-500 dark:text-emerald-400",  // أخضر لو السعة ≤ ٨٠٪
    },
    {
      icon: Fuel,
      label: "CO₂ Saved",
      value: `${center.co2Saved}`,
      unit: "kg",
      color: "text-green-500 dark:text-green-400",
    },
    {
      icon: Truck,
      label: "Active Drivers",
      value: `${center.activeDrivers}`,
      unit: "",
      color: "text-violet-500 dark:text-violet-400",
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full fx-slide-in-right">
      {/* ===== بطاقة المركز النشط ===== */}
      <div className="bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] rounded-2xl p-4 shadow-[0_4px_12px_rgba(226,232,240,0.4)] dark:shadow-none relative overflow-hidden transition-all duration-300">
        
        {/* اسم وأيقونة المركز */}
        <div className="flex items-center gap-3 mb-3 z-10 relative">
          {/* أيقونة المركز بتدرج لوني */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-lg`}>
            <config.icon className="w-5 h-5" />
          </div>
          <div>
            {/* اسم المركز بالإنجليزي */}
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
              {center.name}
            </h4>
            {/* اسم المركز بالعربي */}
            <p className="text-[10px] text-slate-400 dark:text-white/40 font-bold mt-1">
              {center.nameAr}
            </p>
          </div>
        </div>
        
        {/* شارة الحالة */}
        <div className="flex items-center gap-2 z-10 relative">
          {/* نقطة الحالة */}
          <div className={`w-2 h-2 rounded-full ${statusConfig.dot} relative`}>
            {/* لو شغال: نقطة بتنبض */}
            {center.status === "online" && (
              <span className={`absolute inset-0 w-2 h-2 rounded-full ${statusConfig.dot} animate-ping`} />
            )}
          </div>
          {/* نص الحالة */}
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/50">
            {statusConfig.label}
          </span>
          {/* شارة النوع */}
          <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1A1F24] text-slate-500 dark:text-white/40 tracking-wider ml-auto">
            {config.label}
          </span>
        </div>
        
        {/* تأثير توهج في الخلفية */}
        <div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ background: isDark ? config.glow : config.glowLight }}
        />
      </div>

      {/* ===== شبكة المقاييس (٢ عمود) ===== */}
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        {metrics.map((m, idx) => (
          <div
            key={m.label}
            className="fx-fade-in-up bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-[#222930] shadow-[0_2px_8px_rgba(241,245,249,0.3)] hover:shadow-[0_4px_12px_rgba(241,245,249,0.5)] transition-all duration-300 group"
            style={{ animationDelay: `${idx * 0.05}s` }}  // كل بطاقة بتظهر بعد اللي قبلها
          >
            {/* أيقونة + تسمية */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <m.icon className="w-3 h-3 text-slate-400 dark:text-white/30 group-hover:text-slate-500 dark:group-hover:text-white/50 transition-colors" />
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-white/35">
                {m.label}
              </span>
            </div>
            {/* القيمة + الوحدة */}
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-black ${m.color}`}>
                {m.value}
              </span>
              {m.unit && (
                <span className="text-[8px] text-slate-400 dark:text-white/30 font-bold">
                  {m.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===== شريط التحميل الكلي ===== */}
      <div className="bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3 shadow-[0_4px_12px_rgba(226,232,240,0.4)] dark:shadow-none transition-all duration-300">
        <div className="flex justify-between text-[9px] font-bold text-slate-500 dark:text-white/40 mb-2">
          <span>Overall Load</span>
          <span className="text-[#0891B2] dark:text-[#00E5FF]">
            {center.capacity}%
          </span>
        </div>
        {/* شريط التقدم */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${center.capacity}%` }}  // عرض الشريط = نسبة السعة
          />
        </div>
      </div>
    </div>
  );
}


/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */
// ========== المكون الرئيسي ==========
export default function IsometricCentersHub() {
  const [activeCenter, setActiveCenter] = useState<string>("C1");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const { data: rawStaff = [], isLoading: staffLoading } = useQuery<any[]>({
    queryKey: ["hub-staff-all"],
    queryFn: async () => {
      const res = await api.get("/HubStaff/allHubStaff");
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const staffDetailsQueries = useQueries({
    queries: rawStaff.map((s: any, idx: number) => {
      const staffId = s.hubStaffId || s.id || idx;
      return {
        queryKey: ["hub-staff-detail", String(staffId)],
        queryFn: async () => {
          const res = await api.get(`/HubStaff/${staffId}`);
          return res.data || {};
        },
      };
    }),
  });

  const loading = staffLoading || staffDetailsQueries.some((q) => q.isLoading);

  const staffQueryDataString = JSON.stringify(
    staffDetailsQueries.map((q) => ({
      status: q.status,
      fullName: q.data?.fullName,
      historyLength: Array.isArray(q.data?.history) ? q.data.history.length : 0,
      activeDrivers: Array.isArray(q.data?.history)
        ? new Set(q.data.history.map((r: any) => r.recyclerId).filter(Boolean)).size
        : 0,
    }))
  );

  const CENTERS = useMemo<CenterNode[]>(() => {
    if (rawStaff.length === 0) return [];

    const queryData = JSON.parse(staffQueryDataString);

    const gridCoords = [
      { x: 18, y: 38 },
      { x: 42, y: 22 },
      { x: 68, y: 32 },
      { x: 32, y: 68 },
      { x: 55, y: 72 },
      { x: 78, y: 62 },
      { x: 12, y: 55 },
    ];

    return rawStaff.map((s: any, idx: number) => {
      const staffId = s.hubStaffId || s.id || idx;
      let managerName = s.name || "Hub Staff";
      let historyLength = 0;
      let activeDrivers = 0;

      const qResult = queryData[idx];
      if (qResult && qResult.status === "success") {
        if (qResult.fullName) {
          managerName = qResult.fullName;
        }
        historyLength = qResult.historyLength;
        activeDrivers = qResult.activeDrivers;
      }

      const typeList: CenterNode["type"][] = ["collection", "sorting", "processing", "distribution"];
      const type = typeList[idx % typeList.length];
      const coord = gridCoords[idx % gridCoords.length] || { x: 30 + (idx * 15) % 60, y: 20 + (idx * 20) % 60 };

      return {
        id: `C${staffId}`,
        name: `${managerName}'s Hub`,
        nameAr: `مركز ${managerName}`,
        type,
        status: (idx % 8 === 3 ? "maintenance" : (idx % 8 === 5 ? "offline" : "online")) as any,
        x: coord.x,
        y: coord.y,
        capacity: Math.min(95, Math.max(15, historyLength * 8 || 45)),
        throughput: historyLength * 6 || 30,
        efficiency: Math.min(100, Math.max(60, 95 - (idx * 3) % 20)),
        co2Saved: historyLength * 12 || 85,
        temperature: Math.round(20 + (idx * 4) % 15),
        activeDrivers: activeDrivers || 2,
      };
    });
  }, [rawStaff, staffQueryDataString]);

  const CONNECTIONS = useMemo<[string, string][]>(() => {
    if (CENTERS.length < 2) return [];
    const lines: [string, string][] = [];
    for (let i = 0; i < CENTERS.length - 1; i++) {
      lines.push([CENTERS[i].id, CENTERS[i + 1].id]);
    }
    if (CENTERS.length > 2) {
      lines.push([CENTERS[0].id, CENTERS[CENTERS.length - 1].id]);
    }
    return lines;
  }, [CENTERS]);

  useEffect(() => {
    if (CENTERS.length > 0 && !CENTERS.some(c => c.id === activeCenter)) {
      setActiveCenter(CENTERS[0].id);
    }
  }, [CENTERS, activeCenter]);

  const selectedCenter = CENTERS.find((c) => c.id === activeCenter) || CENTERS[0] || { id: "C1", name: "Loading...", nameAr: "جاري التحميل...", type: "collection", status: "online", x: 50, y: 50, capacity: 50, throughput: 0, efficiency: 90, co2Saved: 0, temperature: 25, activeDrivers: 0 };

  // ===== تحويل النسب المئوية لإحداثيات SVG =====
  const SVG_W = 700;  // عرض الـ SVG
  const SVG_H = 420;  // ارتفاع الـ SVG

  const getPos = (c: CenterNode) => ({
    x: (c.x / 100) * SVG_W,  // نحول النسبة لإحداثي أفقي
    y: (c.y / 100) * SVG_H,  // نحول النسبة لإحداثي رأسي
  });
  // مثال: مركز x=50 → (50/100) × 700 = 350 بكسل

  const accentColor = isDark ? "#00E5FF" : "#0891B2";
  const gridStroke = isDark ? "white" : "black";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ===== تعريف الأنيميشنات ===== */}
      <style>{`
        @keyframes fxSlideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fxFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fx-slide-in-right {
          animation: fxSlideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .fx-fade-in-up {
          animation: fxFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* ===== البطاقة الرئيسية ===== */}
      <div className="bg-white/70 dark:bg-[#0a0e14] backdrop-blur-xl rounded-[32px] border border-white/60 dark:border-white/[0.06] shadow-[0_8px_32px_rgba(139,94,60,0.07),_0_2px_8px_rgba(139,94,60,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4),_0_0_1px_rgba(0,229,255,0.06)] overflow-hidden w-full transition-all duration-300">
        
        {/* ===== شريط العنوان ===== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/[0.06] gap-3">
          
          {/* العنوان والأيقونة */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-[10px] font-extrabold uppercase tracking-[2px] text-slate-400 dark:text-white/50">
                Infrastructure Network
              </h3>
              <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                Recycling Centers Hub
              </p>
            </div>
          </div>

          {/* ===== وسيلة الإيضاح (Legend) ===== */}
          <div className="flex items-center gap-4">
            {Object.entries(TYPE_CONFIG).map(([key, val]) => (
              // Object.entries = نحول الكائن لمصفوفة [مفتاح, قيمة]
              // مثال: ["collection", { gradient: "...", icon: ..., label: "Collection" }]
              <div key={key} className="flex items-center gap-1.5">
                {/* دايرة صغيرة بلون النوع */}
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${val.gradient}`} />
                {/* اسم النوع */}
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/35">
                  {val.label}
                </span>
              </div>
            ))}
          </div>

          {/* ===== مؤشر مباشر (Live Indicator) ===== */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#1A1F24] border border-slate-100 dark:border-white/[0.06] shadow-[0_2px_8px_rgba(226,232,240,0.3)] dark:shadow-none px-4 py-2 rounded-full transition-all duration-300">
            <span className="relative flex h-2 w-2">
              {/* دايرة بتنبض (النبض الخارجي) */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              {/* الدايرة الثابتة (اللب) */}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-white/40">
              Live Telemetry
            </span>
          </div>
        </div>

        {/* ===== المحتوى الرئيسي: خريطة + لوحة معلومات ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* ===== الخريطة (٨ أعمدة) ===== */}
          <div className="lg:col-span-8 p-6 relative min-h-[480px] flex items-center justify-center overflow-hidden">
            
            {/* تأثيرات إضاءة محيطة */}
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* ===== شبكة الخلفية ===== */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="iso-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  {/* نمط متكرر: خطين متعامدين */}
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridStroke} strokeWidth="0.5" />
                </pattern>
              </defs>
              {/* تعبئة المساحة بالشبكة */}
              <rect width="100%" height="100%" fill="url(#iso-grid)" />
            </svg>

            {/* ===== الـ SVG الرئيسي ===== */}
            <svg
              viewBox={`-40 -60 ${SVG_W + 80} ${SVG_H + 100}`}  // منطقة الرؤية
              className="w-full h-full max-h-[460px]"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ---- خطوط التوصيل (تحت المباني) ---- */}
              {CONNECTIONS.map(([fromId, toId], idx) => {
                const from = CENTERS.find((c) => c.id === fromId)!;  // المركز الأول
                const to = CENTERS.find((c) => c.id === toId)!;      // المركز الثاني
                const fromPos = getPos(from);  // إحداثيات المركز الأول
                const toPos = getPos(to);      // إحداثيات المركز الثاني
                
                // الخط نشط لو أحد طرفيه هو المركز النشط
                const isActive = activeCenter === fromId || activeCenter === toId;

                return (
                  <ConnectionLine
                    key={`${fromId}-${toId}`}
                    x1={fromPos.x} y1={fromPos.y}
                    x2={toPos.x} y2={toPos.y}
                    isActive={isActive}
                    isDark={isDark}
                    index={idx}
                  />
                );
              })}

              {/* ---- المباني ---- */}
              {CENTERS.map((center) => {
                const pos = getPos(center);  // إحداثيات المركز
                return (
                  <g key={center.id} transform={`translate(${pos.x}, ${pos.y})`}>
                    {/* translate = نقل المجموعة للموقع المطلوب */}
                    <IsometricBuilding
                      center={center}
                      isActive={activeCenter === center.id}  // هل ده المركز النشط؟
                      isDark={isDark}
                      onClick={() => setActiveCenter(center.id)}  // تعيينه كنشط
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ===== لوحة المعلومات (٤ أعمدة) ===== */}
          <div className="lg:col-span-4 bg-slate-50/40 dark:bg-[#0a0e14]/50 border-l border-slate-100 dark:border-white/[0.06] p-5 flex flex-col">
            
            {/* عنوان اللوحة */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3 mb-4">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0891B2] dark:text-[#00E5FF]">
                Center Telemetry
              </span>
              {/* رقم المركز */}
              <span className="text-[8px] font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider bg-slate-100 dark:bg-[#1A1F24] px-2 py-0.5 rounded-full">
                {selectedCenter.id}
              </span>
            </div>

            {/* محتوى اللوحة */}
            <TelemetrySidebar
              key={selectedCenter.id}  // key = يعيد رسم المكون لما المركز يتغير
              center={selectedCenter}
              isDark={isDark}
            />
          </div>
        </div>

        {/* ===== شريط المراكز السفلي ===== */}
        <div className="border-t border-slate-100 dark:border-white/[0.06] px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {CENTERS.map((c) => {
              const config = TYPE_CONFIG[c.type];        // تنسيقات النوع
              const statusCfg = STATUS_COLORS[c.status]; // تنسيقات الحالة
              const isActive = activeCenter === c.id;     // هل المركز ده نشط؟

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCenter(c.id)}  // تعيينه كنشط
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                    isActive
                      ? "bg-[#0891B2]/5 dark:bg-[#00E5FF]/[0.07] border-[#0891B2]/20 dark:border-[#00E5FF]/20 dark:shadow-[0_0_15px_rgba(0,229,255,0.06)]"
                      : "bg-white dark:bg-[#1A1F24] border-slate-100 dark:border-white/[0.06] shadow-[0_2px_8px_rgba(226,232,240,0.3)] hover:bg-slate-50/50 hover:shadow-[0_4px_12px_rgba(226,232,240,0.5)]"
                  }`}
                >
                  {/* أيقونة المركز */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  
                  {/* اسم المركز وكفاءته */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-extrabold text-slate-700 dark:text-white/70 uppercase tracking-wider truncate">
                      {c.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {/* نقطة الحالة */}
                      <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {/* نسبة الكفاءة */}
                      <span className="text-[8px] font-bold text-slate-400 dark:text-white/35">
                        {c.efficiency}% eff.
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

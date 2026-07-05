import { Link } from "react-router";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Recycle,
  Leaf,
  Users,
  Coins,
  Brain,
  QrCode,
  MapPin,
  BarChart3,
  Wallet,
  Shield,
  Droplet,
  Trees,
  TrendingDown,
  X,
  Play,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import FloatingParticles from "../components/FloatingParticles";
import "./landing-animations.css";
import LoginModal from "../components/LoginModal";

/* -------------------------------------------------------------------------- */
/*                               Tailwind Helpers                             */
/* -------------------------------------------------------------------------- */
// خرائط ألوان ثابتة عشان نتجنب مشكلة Tailwind مع الكلاسات الديناميكية
const colorBg: Record<string, string> = {
  emerald: "bg-emerald-100",
  blue: "bg-blue-100",
  amber: "bg-amber-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
  teal: "bg-teal-100",
  cyan: "bg-cyan-100",
};

const colorText: Record<string, string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  green: "text-green-600",
  purple: "text-purple-600",
  teal: "text-teal-600",
  cyan: "text-cyan-600",
};

// ألوان بداية/نهاية للأزرار الجريدينت حسب الدور
const colorBtnFrom: Record<string, string> = {
  emerald: "from-emerald-600",
  blue: "from-blue-600",
  purple: "from-purple-600",
};

const colorBtnTo: Record<string, string> = {
  emerald: "to-emerald-700",
  blue: "to-blue-700",
  purple: "to-purple-700",
};

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */
// شوية Types خفيفة عشان الكود يبقى قوي وواضح في TS
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;
type Stat = {
  icon: IconType;
  label: string;
  value: number;
  suffix?: string;
  color: keyof typeof colorText;
};
type FeatureT = {
  icon: IconType;
  name: string;
  accuracy: number;
  description: string;
};
type StepT = {
  icon: IconType;
  title: string;
  description: string;
};
type RoleT = {
  icon: IconType;
  title: "Citizen" | "Driver" | "Admin";
  description: string;
  features: string[];
  color: keyof typeof colorText;
};
type ImpactEqT = { icon: IconType; text: string };
type ImpactStatT = {
  icon: IconType;
  label: string;
  value: string;
  subtitle: string;
};

/* -------------------------------------------------------------------------- */
/*                                  Data                                      */
/* -------------------------------------------------------------------------- */
// هنا بنحط الداتا اللي UI هيرندر على أساسها — مفصولة عشان التنظيم والأداء
const NAV_ITEMS = ["Features", "How It Works", "Pricing", "Impact"];

const STATS: Stat[] = [
  {
    icon: Recycle,
    label: "Bottles Recycled",
    value: 2547893,
    color: "emerald",
  },
  {
    icon: Users,
    label: "Active Citizens",
    value: 45678,
    suffix: "+",
    color: "blue",
  },
  {
    icon: Coins,
    label: "Points Earned",
    value: 1234567,
    color: "amber",
  },
  {
    icon: Leaf,
    label: "Tons CO₂ Saved",
    value: 3456,
    color: "green",
  },
];

const FEATURES: FeatureT[] = [
  {
    icon: Brain,
    name: "AI Bottle Matching",
    accuracy: 99,
    description: "Identify bottle types instantly with 99.9% accuracy",
  },
  {
    icon: QrCode,
    name: "QR Verification",
    accuracy: 95,
    description: "Secure QR system for instant authentication",
  },
  {
    icon: MapPin,
    name: "Smart Routing",
    accuracy: 87,
    description: "AI-optimized collection routes save 40% fuel costs",
  },
  {
    icon: BarChart3,
    name: "Live Dashboard",
    accuracy: 92,
    description: "Real-time analytics and performance monitoring",
  },
  {
    icon: Wallet,
    name: "Digital Wallet",
    accuracy: 88,
    description: "Instant rewards and seamless point redemption",
  },
  {
    icon: Shield,
    name: "Secure Management",
    accuracy: 96,
    description: "Enterprise-grade security with blockchain verification",
  },
];

const STEPS: StepT[] = [
  {
    icon: Recycle,
    title: "Identify Bottle",
    description: "AI scans bottle type",
  },
  {
    icon: QrCode,
    title: "Scan QR",
    description: "Verify authenticity",
  },
  {
    icon: CheckCircle,
    title: "AI Verify",
    description: "Instant verification",
  },
  {
    icon: MapPin,
    title: "Driver Collect",
    description: "Optimized pickup",
  },
  {
    icon: Coins,
    title: "Earn Points",
    description: "Instant rewards",
  },
];

const ROLES: RoleT[] = [
  {
    icon: Users,
    title: "Citizen",
    description: "Scan and recycle",
    features: ["Scan & Recycle", "Earn Rewards", "Redeem Prizes"],
    color: "emerald",
  },
  {
    icon: MapPin,
    title: "Driver",
    description: "Optimized routes",
    features: ["Optimized Routes", "Live Tracking", "Earn Income"],
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Admin",
    description: "Full control",
    features: ["Full Dashboard", "Deep Analytics", "Manage All Operations"],
    color: "purple",
  },
];

const IMPACT_EQ: ImpactEqT[] = [
  { icon: Recycle, text: "1 Bottle" },
  { icon: TrendingDown, text: "0.5kg CO₂ Saved" },
  { icon: Trees, text: "2 Trees Planted" },
  { icon: Droplet, text: "10L Water Saved" },
];

const IMPACT_STATS: ImpactStatT[] = [
  {
    icon: Recycle,
    label: "Bottles Recycled",
    value: "125,000",
    subtitle: "This Month",
  },
  {
    icon: TrendingDown,
    label: "CO₂ Reduced",
    value: "62,500kg",
    subtitle: "Carbon Offset",
  },
  {
    icon: Droplet,
    label: "Water Saved",
    value: "1,250,000L",
    subtitle: "Conservation",
  },
];

/* -------------------------------------------------------------------------- */
/*                           Animation Helper Functions                       */
/* -------------------------------------------------------------------------- */
// Helper functions for motion props to avoid repetition

// Fade in from bottom with customizable delay and distance
const fadeInUp = (delay: number = 0, distance: number = 20) => ({
  initial: { opacity: 0, y: distance },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

// Scale in animation
const scaleIn = (delay: number = 0, initialScale: number = 0.8) => ({
  initial: { opacity: 0, scale: initialScale },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, delay },
});

// Hover lift with shadow
const hoverLiftShadow = () => ({
  whileHover: {
    y: -10,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  },
  transition: { duration: 0.3 },
});

// Continuous spin animation
const spinForever = (duration: number = 20) => ({
  animate: { rotate: 360 },
  transition: {
    duration,
    repeat: Infinity,
    ease: "linear",
  },
});

// Default viewport settings for whileInView
const inViewDefault = {
  once: true,
  margin: "-50px",
};

/* -------------------------------------------------------------------------- */
/*                             Reusable Components                            */
/* -------------------------------------------------------------------------- */

// TypewriterText: بتكتب كلمات واحدة واحدة وبعدين تمسحها — مع مؤشر بيلمع
const TypewriterText: React.FC = React.memo(function TypewriterText() {
  // الكلمات اللي هتتعرض بالتتابع
  const words = useMemo(
    () => ["Recycle Smart", "Earn Rewards", "Save Planet", "Join Movement"],
    [],
  );
  // حالات التحكم في الكتابة والمسح
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // اللوجيك الأساسي: يكتب حرف حرف وبعدين يمسح حرف حرف
  useEffect(() => {
    const word = words[currentWordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // لسه بيكتب
          if (displayText.length < word.length) {
            setDisplayText(word.slice(0, displayText.length + 1));
          } else {
            // خلص الكلمة — يستنى شوية وبعدين يبدأ يمسح
            setTimeout(() => setIsDeleting(true), 500);
          }
        } else {
          // ور المسح
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            // خلص مسح — روح للكلمة اللي بعدها
            setIsDeleting(false);
            setCurrentWordIndex((currentWordIndex + 1) % words.length);
          }
        }
      },
      isDeleting ? 75 : 150,
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex, words]);

  // كيرсор بيلمع كل نص ثانية
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-emerald-600">
      {displayText}
      {/* ده شكل الكيرсор */}
      <span
        className={`inline-block w-1 h-12 bg-emerald-600 ml-1 ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity`}
      >
        |
      </span>
    </span>
  );
});

// AnimatedCounter: عدّاد بيتزايد لحد رقم معين بحركة smooth (easeOutExpo)
function AnimatedCounter({
  end,
  duration = 2.5,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = 0;
    let animationFrame = 0;

    // دالة easing نعومة للطلوع
    const easeOutExpo = (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
    const animate = (t: number) => {
      if (!startTime) startTime = t;
      const elapsed = t - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = easeOutExpo(progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

// QRScannerModal: مودال سكان للـ QR — مع دخول/خروج smooth
function QRScannerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        // خلفية مودال مع فادينج
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* صندوق المودال نفسه بيكبر ويطلع لفوق سنة */}
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{
              duration: 0.3,
              type: "spring",
              damping: 25,
            }}
            className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* زرار X يقفل المودال — مع دوران بسيط في الهوفر */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="text-center">
              {/* أيقونة QR بتدخل بسبرينج */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <QrCode className="w-8 h-8 text-emerald-600" />
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Scan QR Code
              </h3>
              <p className="text-gray-600 mb-6">
                Point your camera at the bottle QR code
              </p>

              {/* مربع تمثيلي للكاميرا — بيلمع بنبض */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(16,185,129,0.4)",
                    "0 0 0 20px rgba(16,185,129,0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center border-4 border-emerald-500 border-dashed"
              >
                {/* أيقونة QR بتلف لف مستمر */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <QrCode className="w-32 h-32 text-gray-400" />
                </motion.div>
              </motion.div>

              {/* زرار تشغيل الكاميرا (ديكور في الديمو) */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(16,185,129,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Start Camera
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------- UI Utilities ------------------------------- */
// SectionHeading: هيدر موحّد لأي سكشن (عنوان + ساب تايتل اختياري)
function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div {...fadeInUp(0.0)} className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.div>
  );
}

// StatCard: كارت إحصائية فيه أيقونة + رقم متحرك + عنوان
function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
      }}
      {...hoverLiftShadow()}
      className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg transition-all cursor-pointer border border-transparent hover:border-emerald-200"
    >
      {/* مربع الأيقونة بلون حسب الكولور */}
      <motion.div
        className={`w-12 h-12 ${colorBg[stat.color]} rounded-lg flex items-center justify-center mb-4`}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className={`w-6 h-6 ${colorText[stat.color]}`} />
      </motion.div>

      {/* الرقم المتحرك */}
      <div className={`text-3xl font-bold ${colorText[stat.color]} mb-1`}>
        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
      </div>

      <div className="text-sm text-gray-600">{stat.label}</div>
    </motion.div>
  );
}

// FeatureCard: كارت ميزة — أيقونة، اسم، وصف، وبروجرس دقيقته
function FeatureCard({ feature, index }: { feature: FeatureT; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: 90 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{
        y: -15,
        boxShadow: "0 25px 50px rgba(16,185,129,0.2)",
        borderColor: "rgb(16,185,129)",
      }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg cursor-pointer border-2 border-transparent"
    >
      <motion.div
        className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-4"
        whileHover={{ scale: 1.15 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-7 h-7 text-emerald-600" />
      </motion.div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {feature.name}
      </h3>
      <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>

      {/* جزء الدقة + البار امتحرك */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Accuracy</span>
          <motion.span
            className="font-semibold text-emerald-600"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            {feature.accuracy}%
          </motion.span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${feature.accuracy}%` }}
            viewport={{ once: true }}
            transition={{
              duration: 1.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 relative"
            style={{
              boxShadow: "0 0 10px rgba(16,185,129,0.5)",
            }}
          >
            {/* لمعان بيعدي على البار */}
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// StepItem: عنصر خطوة من خطوات "إزاي شغال"
function StepItem({ step, index }: { step: StepT; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{
        delay: index * 0.2,
        duration: 0.5,
        type: "spring",
      }}
      className="text-center"
    >
      <motion.div
        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-emerald-500 relative z-10 cursor-pointer"
        whileHover={{
          scale: 1.2,
          rotate: 360,
          boxShadow: "0 0 30px rgba(16,185,129,0.6)",
        }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-10 h-10 text-emerald-600" />
      </motion.div>
      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
      <p className="text-sm text-gray-600">{step.description}</p>
    </motion.div>
  );
}

// RoleCard: كارت دور (مواطن/سواق/أدمن) فيه Features وزرار CTA
function RoleCard({ role, index }: { role: RoleT; index: number }) {
  const Icon = role.icon;
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{
        y: -15,
        scale: 1.03,
        boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
        borderColor: "rgb(16,185,129)",
      }}
      className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent cursor-pointer"
    >
      {/* مربع الأيقونة بلون الدور */}
      <motion.div
        className={`w-16 h-16 ${colorBg[role.color]} rounded-2xl flex items-center justify-center mb-6 mx-auto`}
        whileHover={{ scale: 1.2 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className={`w-8 h-8 ${colorText[role.color]}`} />
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
        {role.title}
      </h3>
      <p className="text-gray-600 text-center mb-6">{role.description}</p>

      {/* مميزات الدور */}
      <ul className="space-y-3 mb-6">
        {role.features.map((feature, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + i * 0.1 }}
            className="flex items-center gap-2 text-gray-700"
          >
            <CheckCircle
              className={`w-5 h-5 ${colorText[role.color]} flex-shrink-0`}
            />
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* زرار الانتقال حسب الدور */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          to={role.title === "Admin" ? "/dashboard" : "/citizen-portal"}
          className={`block w-full px-6 py-3 bg-gradient-to-r ${colorBtnFrom[role.color]} ${colorBtnTo[role.color]} text-white rounded-lg hover:shadow-lg transition-all text-center`}
        >
          Get Started
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ImpactStatCard: كارت إحصائية في سكشن التأثير البيئي
function ImpactStatCard({ stat, index }: { stat: ImpactStatT; index: number }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        y: -10,
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center cursor-pointer border border-white/20"
    >
      <motion.div
        whileHover={{ y: -15, scale: 1.15 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
      >
        <Icon className="w-12 h-12 mx-auto mb-4" />
      </motion.div>
      <div className="text-3xl font-bold mb-1">{stat.value}</div>
      <div className="text-sm text-green-100 mb-1">{stat.label}</div>
      <div className="text-xs text-green-200">{stat.subtitle}</div>
    </motion.div>
  );
}

// LiquidProgress: شريط تقدم "سا  ل" لذيذ بيعمل ويف لا نهائية
function LiquidProgress({ progress /* 0..1 */ }: { progress: number }) {
  return (
    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative"
        style={{
          borderRadius: "9999px",
          boxShadow: "0 0 20px rgba(16,185,129,0.5)",
        }}
      >
        {/* طبقة لمعان بتمشي يمين شمال وتدي إحساس السائل */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */
// LandingPage: الصفحة الرئيسية كلها — مجمّع فيها كل السكاشن
export default function LandingPage() {
  // scrolled: نغير شكل النافبار لما المستخدم ينزل شوية
  const [scrolled, setScrolled] = useState(false);
  // qrModalOpen: فتح/قفل مودال سكان QR
  const [qrModalOpen, setQrModalOpen] = useState(false);
  // loginModalOpen: فتح/قفل مودال تسجيل الدخول
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  // bottleCount: سلايدر عدد الزجاجات في الكالكوليتر
  const [bottleCount, setBottleCount] = useState(100);

  // listener بسيط للسكرول عشان النافبار يتغير
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // حسابات الكالكوليتر — متلفوفة بـ useMemo عشان الأداء وما تتحسبش على الفاضي
  const calculatedValue = useMemo(() => bottleCount * 0.5, [bottleCount]);
  const calculatedPoints = useMemo(() => bottleCount * 10, [bottleCount]);
  const calculatedCO2 = useMemo(() => bottleCount * 0.5, [bottleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Particles خلفية لطيفة */}
      <FloatingParticles />

      {/* ------------------------------- Navbar ------------------------------- */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-white/80 backdrop-blur-xl shadow-xl" : "bg-transparent"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 100,
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* لوجو + اسم */}
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div {...spinForever(20)}>
                <Recycle className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                RecycleHub
              </span>
            </motion.div>

            {/* روابط التنقل */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_ITEMS.map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-gray-700 hover:text-emerald-600 transition-all relative group"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                  {/* خط صغير يظهر تحت اللينك عند الهوفر */}
                  <motion.span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* أزرار الدخول والتسجيل */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setLoginModalOpen(true)}
                className="hidden sm:block px-6 py-2 text-emerald-600 font-bold hover:bg-emerald-50 rounded-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                تسجيل الدخول
              </motion.button>

              <motion.button
                onClick={() => setLoginModalOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                إنشاء حساب
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp(0.0, 50)}>
            {/* تايتل كبير فيه الكتابة المتحركة */}
            <motion.h1
              className="text-6xl md:text-7xl font-bold text-gray-900 mb-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <TypewriterText />
            </motion.h1>

            {/* وصف قصير للمنتج */}
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Transform bottle recycling with QR verification, AI matching, live
              tracking, and instant rewards
            </motion.p>

            {/* أزرار CTA */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {/* زرار فتح مودال الـ QR */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(16,185,129,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQrModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg group"
              >
                <QrCode className="w-5 h-5" />
                Scan QR Code
                {/* سهم بيتحرك يمين شمال عشان يدي إحساس حركة */}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              {/* زرار ووتش ديمو (شكلي) */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all flex items-center gap-2 shadow-lg border border-emerald-200 group"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------- Live Counters ---------------------------- */}
      <section className="relative z-10 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* بنرندر كروت الإحصائيات من الاري */}
            {STATS.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- Features ------------------------------ */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            title="Powerful Features"
            subtitle="Advanced technology for seamless recycling experience"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- How It Works ----------------------------- */}
      <section
        id="how-it-works"
        className="relative z-10 py-20 px-4 bg-white/40 backdrop-blur-sm"
      >
        <div className="container mx-auto">
          <SectionHeading
            title="How It Works"
            subtitle="Simple 5-step process"
          />

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* خط تقدم متحرك ورا الخطوات */}
              <div className="absolute top-12 left-0 right-0 h-2 bg-gray-200 rounded-full hidden md:block overflow-hidden">
                <motion.div
                  initial={{ width: 0, x: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative"
                  style={{
                    boxShadow: "0 0 20px rgba(16,185,129,0.6)",
                  }}
                >
                  {/* لمعان بيجري على الخط */}
                  <motion.div
                    className="absolute inset-0 bg-white/30"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>

              {/* عناصر الخطوات نفسها */}
              <div className="grid md:grid-cols-5 gap-8 relative">
                {STEPS.map((step, i) => (
                  <StepItem key={i} step={step} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- Rewards Calculator ------------------------- */}
      <section id="pricing" className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={inViewDefault}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-100"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                Rewards Calculator
              </h2>
              <p className="text-gray-600">Calculate your potential earnings</p>
            </div>

            <div className="space-y-6">
              {/* سلايدر عدد الزجاجات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bottles:{" "}
                  <span className="text-emerald-600 font-bold">
                    {bottleCount}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={bottleCount}
                  onChange={(e) => setBottleCount(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* 3 كروت نتايج (فلوس/نقط/CO2) */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Coins,
                    label: "Cash Value",
                    value: `$${calculatedValue.toFixed(2)}`,
                    color: "emerald",
                    gradient: "from-emerald-50 to-teal-50",
                  },
                  {
                    icon: Wallet,
                    label: "Reward Points",
                    value: calculatedPoints.toLocaleString(),
                    color: "purple",
                    gradient: "from-purple-50 to-pink-50",
                  },
                  {
                    icon: Leaf,
                    label: "CO₂ Saved",
                    value: `${calculatedCO2}kg`,
                    color: "green",
                    gradient: "from-green-50 to-emerald-50",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      }}
                      className={`bg-gradient-to-br ${item.gradient} rounded-xl p-6 cursor-pointer`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div transition={{ duration: 0.6 }}>
                          <Icon
                            className={`w-5 h-5 ${colorText[item.color as keyof typeof colorText]}`}
                          />
                        </motion.div>
                        <span className="text-sm text-gray-600">
                          {item.label}
                        </span>
                      </div>
                      <motion.div
                        key={item.value}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-3xl font-bold ${colorText[item.color as keyof typeof colorText]}`}
                      >
                        {item.value}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* شريط السائل */}
              <LiquidProgress progress={bottleCount / 1000} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* -------------------------------- Roles -------------------------------- */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            title="Choose Your Role"
            subtitle="Join as a citizen, driver, or admin"
          />
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {ROLES.map((role, i) => (
              <RoleCard key={i} role={role} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- Impact ------------------------------- */}
      <section
        id="impact"
        className="relative z-10 py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white overflow-hidden"
      >
        <div className="container mx-auto relative z-10">
          {/* Custom heading for Impact section with white text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Environmental Impact
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Making a real difference for our planet
            </p>
          </motion.div>

          {/* معادلة التأثير — كروت صغيرة جنب بعض */}
          <motion.div
            className="max-w-4xl mx-auto mb-12"
            {...scaleIn(0.0, 0.9)}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Impact Equation
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
                {IMPACT_EQ.map((item, index, array) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`impact-item-${index}`}
                      className="flex items-center gap-4"
                    >
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                      >
                        <Icon className="w-6 h-6" />
                        <span>{item.text}</span>
                      </motion.div>
                      {/* علامة = بين العناصر */}
                      {index < array.length - 1 && (
                        <span className="text-2xl">=</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* تلات كروت إحصائيات للتأثير */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {IMPACT_STATS.map((stat, i) => (
              <ImpactStatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------- CTA --------------------------------- */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={inViewDefault}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* نقط صغيرة أنيميشن في الخلفية عشان تدي حياة */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to Start Recycling Smart?
            </motion.h2>

            <motion.p
              className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of citizens making a difference. Start earning
              rewards today!
            </motion.p>

            {/* أزرار CTA تحت */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(255,255,255,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLoginModalOpen(true)}
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all flex items-center gap-2 shadow-lg font-semibold group"
              >
                Get Started Free
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-emerald-800 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg font-semibold"
              >
                Schedule Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* -------------------------------- Footer ------------------------------- */}
      <footer className="relative z-10 bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* جزء البراند */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div {...spinForever(20)}>
                  <Recycle className="w-6 h-6" />
                </motion.div>
                <span className="text-xl font-bold">RecycleHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smart bottle recycling system with AI verification and instant
                rewards.
              </p>
            </motion.div>

            {/* روابط الفوتر */}
            {[
              {
                title: "Product",
                links: ["Features", "How It Works", "Pricing", "Dashboard"],
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security"],
              },
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        className="hover:text-white transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* حقوق النشر + لينك الباورد */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2025 RecycleHub. All rights reserved.
            </p>
            <motion.a
              href="https://readdy.link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Powered by Readdy
            </motion.a>
          </div>
        </div>
      </footer>

      {/* مودالات */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}

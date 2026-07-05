"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Recycle,
  Leaf,
  Users,
  Coins,
  QrCode,
  MapPin,
  Play,
  ArrowRight,
  Cpu,
} from "lucide-react";

// Local Subcomponents
import { StatCard } from "./StatCard";
import { WasteCategoryCard } from "./WasteCategoryCard";
import { StepItem } from "./StepItem";
import { RoleCard } from "./RoleCard";
import { ImpactStatCard } from "./ImpactStatCard";
import { LiquidProgress } from "./LiquidProgress";
import { QRScannerModal } from "./QRScannerModal";
import { SectionHeading } from "./SectionHeading";
import { Stat, FeatureT, StepT, RoleT, ImpactEqT, ImpactStatT, WasteCategory } from "./types";

// Reusable Components & Hooks
import FloatingParticles from "../FloatingParticles";
import { CyclingText } from "../CyclingText";
import { MaskWipeText } from "../MaskWipeText";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/app/components/navigation/LanguageToggle";

import "./landing-animations.css";

/* -------------------------------------------------------------------------- */
/*                                  Data                                      */
/* -------------------------------------------------------------------------- */
const NAV_ITEMS = ["Features", "How It Works", "Pricing", "Impact"];

const FEATURES: FeatureT[] = [
  {
    icon: Recycle,
    name: "AI Bottle Matching",
    accuracy: 99,
    description: "Identify bottle types instantly with 99.9% accuracy",
  },
  {
    icon: Coins,
    name: "Instant Rewards",
    accuracy: 98,
    description: "Earn points instantly upon drop-off verification",
  },
  {
    icon: MapPin,
    name: "Smart Routing",
    accuracy: 87,
    description: "AI-optimized collection routes save 40% fuel costs",
  },
  {
    icon: Recycle,
    name: "Live Dashboard",
    accuracy: 92,
    description: "Real-time analytics and performance monitoring",
  },
  {
    icon: Recycle,
    name: "Digital Wallet",
    accuracy: 88,
    description: "Instant rewards and seamless point redemption",
  },
  {
    icon: Recycle,
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
  { icon: MapPin, title: "Find Hub", description: "Locate closest center" },
  { icon: Recycle, title: "AI Verify", description: "Instant verification" },
  { icon: MapPin, title: "Driver Collect", description: "Optimized pickup" },
  { icon: Coins, title: "Earn Points", description: "Instant rewards" },
];

const ROLES: RoleT[] = [
  {
    icon: Users,
    title: "User",
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
    icon: Recycle,
    title: "Admin",
    description: "Full control",
    features: ["Full Dashboard", "Deep Analytics", "Manage All Operations"],
    color: "purple",
  },
];

const IMPACT_EQ: ImpactEqT[] = [
  { icon: Recycle, text: "1 Bottle" },
  { icon: Recycle, text: "0.5kg CO₂ Saved" },
  { icon: Recycle, text: "2 Trees Planted" },
  { icon: Recycle, text: "10L Water Saved" },
];

const IMPACT_STATS: ImpactStatT[] = [
  {
    icon: Recycle,
    label: "Bottles Recycled",
    value: "125,000",
    subtitle: "This Month",
  },
  {
    icon: Recycle,
    label: "CO₂ Reduced",
    value: "62,500kg",
    subtitle: "Carbon Offset",
  },
  {
    icon: Recycle,
    label: "Water Saved",
    value: "1,250,000L",
    subtitle: "Conservation",
  },
];

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */
export default function LandingPage() {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [bottleCount, setBottleCount] = useState(100);
  const [mounted, setMounted] = useState(false);
  const { t, language } = useLanguage();

  const [totalRecyclers, setTotalRecyclers] = useState<number | null>(null);
  const [activeRecyclers, setActiveRecyclers] = useState<number | null>(null);
  const [totalPickups, setTotalPickups] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalWalletPoints, setTotalWalletPoints] = useState<number | null>(null);
  const [wasteCategories, setWasteCategories] = useState<WasteCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | null>(null);

  useEffect(() => {
    setMounted(true);

    const loadLandingData = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "https://smartwaste.runasp.net";
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch all stats and configurations from API
        const [
          resTotal,
          resActive,
          resPickups,
          resEarnings,
          resCategories,
          resTotalUsers,
          resTotalPoints,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/total-recyclers`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/total-recycling-active`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/total-pickup-requests`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/Total-Earing`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/waste-categories`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/total-users`, { headers }),
          axios.get(`${API_BASE_URL}/api/admin/total-wallet-points`, { headers }),
        ]);

        if (typeof resTotal.data === "number") {
          setTotalRecyclers(resTotal.data);
        } else if (resTotal.data && typeof resTotal.data.total === "number") {
          setTotalRecyclers(resTotal.data.total);
        }

        if (typeof resActive.data === "number") {
          setActiveRecyclers(resActive.data);
        } else if (resActive.data && typeof resActive.data.active === "number") {
          setActiveRecyclers(resActive.data.active);
        }

        if (typeof resPickups.data === "number") {
          setTotalPickups(resPickups.data);
        } else if (resPickups.data && typeof resPickups.data.total === "number") {
          setTotalPickups(resPickups.data.total);
        }

        if (typeof resEarnings.data === "number") {
          setTotalEarnings(resEarnings.data);
        } else if (resEarnings.data && typeof resEarnings.data.totalEarnings === "number") {
          setTotalEarnings(resEarnings.data.totalEarnings);
        }

        if (typeof resTotalUsers.data === "number") {
          setTotalUsers(resTotalUsers.data);
        } else if (resTotalUsers.data && typeof resTotalUsers.data.total === "number") {
          setTotalUsers(resTotalUsers.data.total);
        }

        if (typeof resTotalPoints.data === "number") {
          setTotalWalletPoints(resTotalPoints.data);
        } else if (resTotalPoints.data && typeof resTotalPoints.data.total === "number") {
          setTotalWalletPoints(resTotalPoints.data.total);
        }

        if (Array.isArray(resCategories.data)) {
          const categoriesData: WasteCategory[] = resCategories.data.map((cat: any) => {
            const nameLower = cat.categoryName.toLowerCase();
            let icon = Recycle;
            let description = "";
            let displayName = cat.categoryName;

            if (nameLower === "classes") {
              displayName = "Glass";
            } else if (nameLower === "plastics" || nameLower === "plastic") {
              displayName = "Plastic";
            } else if (nameLower === "anim") {
              displayName = "Aluminum";
            } else if (nameLower === "updated category") {
              displayName = "Cardboard";
            }

            if (nameLower.includes("plastic")) {
              icon = Recycle;
              description = "PET bottles, containers, and other recyclable plastic packaging.";
            } else if (nameLower.includes("paper") || nameLower.includes("cardboard") || nameLower.includes("updated category")) {
              icon = Leaf;
              description = "Cardboard boxes, newspapers, magazines, and office paper waste.";
            } else if (nameLower.includes("glass") || nameLower.includes("class")) {
              icon = Recycle;
              description = "Glass jars, beverage bottles, and glass container recycling.";
            } else if (nameLower.includes("metal") || nameLower.includes("anim")) {
              icon = Coins;
              description = "Aluminum cans, tin foil, steel packaging, and metal containers.";
            } else if (nameLower.includes("electron")) {
              icon = Cpu;
              description = "Old phones, chargers, circuit boards, and electronic components.";
            } else {
              description = "Recyclable waste materials sorted and processed using our smart systems.";
            }

            return {
              ...cat,
              categoryName: displayName,
              icon,
              description
            };
          });

          setWasteCategories(categoriesData);
          if (categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to load landing page API data", err);
      }
    };

    loadLandingData();
  }, [language]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const STATS: Stat[] = useMemo(
    () => [
      {
        icon: Recycle,
        label: t("landing.stats.pickups"),
        value: totalPickups ?? 0,
        suffix: "",
        color: "emerald",
      },
      {
        icon: Users,
        label: t("landing.stats.recyclers"),
        value: totalRecyclers ?? 0,
        suffix: "",
        color: "purple",
      },
      {
        icon: Users,
        label: t("landing.stats.active"),
        // Show 0 as-is — do not substitute from another endpoint
        value: activeRecyclers ?? 0,
        suffix: "",
        noDataLabel: activeRecyclers === 0 ? (language === "ar" ? "لا يوجد بيانات" : "No data") : undefined,
        color: "blue",
      },
      {
        icon: Coins,
        label: t("landing.stats.earnings"),
        value: totalEarnings ?? 0,
        suffix: " $",
        color: "amber",
      },
    ],
    [activeRecyclers, totalRecyclers, totalPickups, totalEarnings, t, language],
  );

  const localizedFeatures = useMemo(() => [
    {
      icon: Recycle,
      name: t("landing.features.aiMatch"),
      accuracy: 99.9,
      description: t("landing.features.aiMatchDesc"),
    },
    {
      icon: QrCode,
      name: t("landing.features.qrVerify"),
      accuracy: 95,
      description: t("landing.features.qrVerifyDesc"),
    },
    {
      icon: MapPin,
      name: t("landing.features.routing"),
      accuracy: 87,
      description: t("landing.features.routingDesc"),
    },
    {
      icon: Recycle,
      name: t("landing.features.dashboard"),
      accuracy: 92,
      description: t("landing.features.dashboardDesc"),
    },
    {
      icon: Recycle,
      name: t("landing.features.wallet"),
      accuracy: 88,
      description: t("landing.features.walletDesc"),
    },
    {
      icon: Recycle,
      name: t("landing.features.security"),
      accuracy: 96,
      description: t("landing.features.securityDesc"),
    },
  ], [t]);

  const localizedSteps = useMemo(() => [
    { icon: Recycle, title: t("landing.steps.identify"), description: t("landing.steps.identifyDesc") },
    { icon: QrCode, title: t("landing.steps.scan"), description: t("landing.steps.scanDesc") },
    { icon: Recycle, title: t("landing.steps.verify"), description: t("landing.steps.verifyDesc") },
    { icon: MapPin, title: t("landing.steps.collect"), description: t("landing.steps.collectDesc") },
    { icon: Coins, title: t("landing.steps.earn"), description: t("landing.steps.earnDesc") },
  ], [t]);

  const localizedRoles = useMemo(() => [
    {
      icon: Users,
      title: t("auth.roleCitizen"),
      description: totalUsers !== null 
        ? `${t("landing.roles.citizenDesc")} (${formatNumber(totalUsers)} active citizens)` 
        : t("landing.roles.citizenDesc"),
      features: [
        t("landing.roles.citizenFeat.0", "Scan & Recycle"),
        t("landing.roles.citizenFeat.1", "Earn Rewards"),
        t("landing.roles.citizenFeat.2", "Redeem Prizes")
      ],
      color: "emerald",
    },
    {
      icon: MapPin,
      title: t("auth.roleDriver"),
      description: totalRecyclers !== null 
        ? `${t("landing.roles.driverDesc")} (${formatNumber(totalRecyclers)} active drivers)` 
        : t("landing.roles.driverDesc"),
      features: [
        t("landing.roles.driverFeat.0", "Optimized Routes"),
        t("landing.roles.driverFeat.1", "Live Tracking"),
        t("landing.roles.driverFeat.2", "Earn Income")
      ],
      color: "blue",
    },
    {
      icon: Recycle,
      title: t("auth.roleAdmin"),
      description: t("landing.roles.adminDesc"),
      features: [
        t("landing.roles.adminFeat.0", "Full Dashboard"),
        t("landing.roles.adminFeat.1", "Deep Analytics"),
        t("landing.roles.adminFeat.2", "Manage All Operations")
      ],
      color: "purple",
    },
  ], [t, totalUsers, totalRecyclers, language]);

  const localizedImpactEq = useMemo(() => [
    { icon: Recycle, text: "1 Bottle" },
    { icon: Recycle, text: "0.5kg CO₂ Saved" },
    { icon: Recycle, text: "2 Trees Planted" },
    { icon: Recycle, text: "10L Water Saved" },
  ], []);

  const localizedImpactStats = useMemo(() => {
    // Compute estimates from totalPickups — clearly labelled as Estimated
    const bottlesEst = totalPickups !== null ? totalPickups * 125 : null;
    const co2Est = bottlesEst !== null ? bottlesEst * 0.5 : null;
    const waterEst = bottlesEst !== null ? bottlesEst * 10 : null;
    const estimatedLabel = language === "ar" ? "تقديري" : "Estimated";

    return [
      {
        icon: Recycle,
        label: t("landing.impactStats.bottles"),
        value: bottlesEst !== null ? bottlesEst.toLocaleString() : "—",
        subtitle: bottlesEst !== null
          ? `${estimatedLabel} · ${t("landing.impactStats.bottlesSubtitle")}`
          : (language === "ar" ? "لا يوجد بيانات" : "No data available"),
      },
      {
        icon: Recycle,
        label: t("landing.impactStats.co2"),
        value: co2Est !== null ? `${co2Est.toLocaleString()}kg` : "—",
        subtitle: co2Est !== null
          ? `${estimatedLabel} · ${t("landing.impactStats.co2Subtitle")}`
          : (language === "ar" ? "لا يوجد بيانات" : "No data available"),
      },
      {
        icon: Recycle,
        label: t("landing.impactStats.water"),
        value: waterEst !== null ? `${waterEst.toLocaleString()}L` : "—",
        subtitle: waterEst !== null
          ? `${estimatedLabel} · ${t("landing.impactStats.waterSubtitle")}`
          : (language === "ar" ? "لا يوجد بيانات" : "No data available"),
      },
    ];
  }, [totalPickups, t, language]);

  const localizedNavItems = useMemo(() => [
    { label: t("landing.featuresTitle"), href: "#features" },
    { label: t("landing.howItWorksTitle"), href: "#how-it-works" },
    { label: t("landing.calculatorTitle"), href: "#pricing" },
    { label: t("landing.impactTitle"), href: "#impact" },
  ], [t]);

  const calculatedPoints = useMemo(() => {
    const rate = selectedCategory ? selectedCategory.pointsPerUnit : 10;
    return bottleCount * rate;
  }, [bottleCount, selectedCategory]);

  const calculatedValue = useMemo(() => {
    return calculatedPoints * 0.05;
  }, [calculatedPoints]);

  const calculatedCO2 = useMemo(() => {
    return bottleCount * 0.5;
  }, [bottleCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {mounted && <FloatingParticles />}

      {/* ------------------------------- Navbar ------------------------------- */}
      <nav className="animate-nav-drop fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-transparent">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/40 bg-white/60 px-4 py-2.5 shadow-lg shadow-emerald-900/5 backdrop-blur-xl">
            <div className="group flex items-center gap-2.5 flex-shrink-0 cursor-pointer transition-transform duration-200 hover:scale-[1.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30 transition-transform duration-300 group-hover:rotate-12">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t("common.appName")}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1 rounded-full bg-emerald-50/60 p-1">
              {localizedNavItems.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="animate-nav-item relative rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:text-emerald-700 hover:bg-white/80 hover:-translate-y-px whitespace-nowrap"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <LanguageToggle />
              <Link
                href="/login"
                className="hidden sm:block rounded-full px-5 py-2 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:scale-[1.04] active:scale-95 whitespace-nowrap cursor-pointer"
              >
                {t("common.signIn")}
              </Link>

              <Link
                href="/signup"
                className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:shadow-emerald-500/50 hover:scale-[1.04] active:scale-95 whitespace-nowrap cursor-pointer"
              >
                {t("common.getStarted")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="animate-scale-pop text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              <CyclingText
                texts={
                  language === "ar"
                    ? [
                        "أعد التدوير بذكاء",
                        "اكسب المكافآت",
                        "احمِ كوكبك",
                        "انضم إلينا",
                      ]
                    : [
                        "Recycle Smart",
                        "Earn Rewards",
                        "Save Planet",
                        "Join Movement",
                      ]
                }
              />
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              <MaskWipeText text={t("landing.heroSubtitle")} />
            </p>

            <div
              className="animate-fade-in-up flex flex-wrap gap-4 justify-center"
              style={{ animationDelay: "0.6s" }}
            >
              <button
                onClick={() => setQrModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] cursor-pointer font-semibold"
              >
                <QrCode className="w-5 h-5" />
                {t("common.scanQr")}
                <span className="inline-flex animate-arrow-nudge">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>

              <button className="group px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg border border-emerald-200 hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] cursor-pointer font-semibold">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {t("common.watchDemo")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- Live Counters ---------------------------- */}
      <section className="relative z-10 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            title={
              wasteCategories.length > 0
                ? language === "ar"
                  ? "فئات النفايات المدعومة و المخطط لها : بيتا"
                  : "Supported Waste Categories - Beta"
                : t("landing.featuresTitle")
            }
            subtitle={
              wasteCategories.length > 0
                ? language === "ar"
                  ? "نحن نقبل أنواعًا مختلفة من النفايات ونكافئك بالنقاط عن كل وحدة."
                  : "We accept various types of waste materials and reward you with points for each unit."
                : t("landing.featuresSubtitle")
            }
            showBeta={wasteCategories.length > 0}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wasteCategories.length > 0
              ? wasteCategories.map((category, i) => (
                  <WasteCategoryCard
                    key={category.categoryName}
                    category={category}
                    index={i}
                  />
                ))
              : localizedFeatures.map((feature, i) => {
                  const category: WasteCategory = {
                    categoryName: feature.name,
                    pointsPerUnit: 10,
                    imagePath: null,
                    icon: feature.icon,
                    description: feature.description,
                  };
                  return (
                    <WasteCategoryCard
                      key={category.categoryName}
                      category={category}
                      index={i}
                    />
                  );
                })}
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
            title={t("landing.howItWorksTitle")}
            subtitle={t("landing.howItWorksSubtitle")}
          />

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute top-12 left-0 right-0 h-2 bg-gray-200 rounded-full hidden md:block overflow-hidden">
                <ProgressLine />
              </div>

              <div className="grid md:grid-cols-5 gap-8 relative">
                {localizedSteps.map((step, i) => (
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
          <div
            data-aos="fade-up"
            className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-100"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                {t("landing.calculatorTitle")}
              </h2>
              <p className="text-gray-600">{t("landing.calculatorSubtitle")}</p>
            </div>

            <div className="space-y-6">
              {/* Category Dropdown Selector */}
              {wasteCategories.length > 0 && (
                <div className="animate-fade-in-up">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === "ar" ? "فئة النفايات:" : "Waste Category:"}
                  </label>
                  <select
                    value={selectedCategory?.categoryName || ""}
                    onChange={(e) => {
                      const cat = wasteCategories.find(
                        (c) => c.categoryName === e.target.value,
                      );
                      if (cat) setSelectedCategory(cat);
                    }}
                    className="w-full bg-white/80 backdrop-blur-md border border-emerald-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700 shadow-sm capitalize transition-all duration-200 cursor-pointer hover:border-emerald-300 font-medium font-semibold"
                  >
                    {wasteCategories.map((cat) => (
                      <option
                        key={cat.categoryName}
                        value={cat.categoryName}
                        className="text-gray-700 font-semibold"
                      >
                        {cat.categoryName} ({cat.pointsPerUnit}{" "}
                        {language === "ar" ? "نقاط/وحدة" : "pts/unit"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {language === "ar" ? "عدد الوحدات:" : "Number of Units:"}{" "}
                  <span className="text-emerald-600 font-bold">
                    {formatNumber(bottleCount)}
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

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    label: language === "ar" ? "القيمة النقدية" : "Cash Value",
                    value: `$${calculatedValue.toFixed(2)}`,
                    gradient: "from-emerald-50 to-teal-50",
                  },
                  {
                    label:
                      language === "ar" ? "نقاط المكافأة" : "Reward Points",
                    value: formatNumber(calculatedPoints),
                    gradient: "from-purple-50 to-pink-50",
                  },
                  {
                    label:
                      language === "ar"
                        ? "توقعات خفض الكربون *تقديري"
                        : "CO₂ Projection *Estimated",
                    value:
                      language === "ar"
                        ? `${formatNumber(calculatedCO2)} كجم`
                        : `${calculatedCO2}kg`,
                    gradient: "from-green-50 to-emerald-50",
                  },
                ].map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`bg-gradient-to-br ${item.gradient} rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Recycle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm text-gray-600 font-medium">
                          {item.label}
                        </span>
                      </div>
                      <div
                        key={item.value}
                        className="animate-fade-in text-3xl font-bold text-emerald-600"
                      >
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              <LiquidProgress progress={bottleCount / 1000} />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- Roles -------------------------------- */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <SectionHeading
            title={t("landing.rolesTitle")}
            subtitle={t("landing.rolesSubtitle")}
          />
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {localizedRoles.map((role, i) => (
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
          <div className="animate-fade-in-up text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t("landing.impactTitle")}
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto flex items-center justify-center gap-3 flex-wrap">
              <span>{t("landing.impactSubtitle")}</span>
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-white uppercase font-semibold tracking-wider">
                Estimated
              </span>
            </p>
          </div>

          <div data-aos="fade-up" className="max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Impact Equation
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
                {localizedImpactEq.map((item, index, array) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`impact-item-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110 hover:-translate-y-1.5">
                        <Icon className="w-6 h-6 animate-pulse" />
                        <span>{item.text}</span>
                      </div>
                      {index < array.length - 1 && (
                        <span className="text-2xl">=</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {localizedImpactStats.map((stat, i) => (
              <ImpactStatCard key={i} stat={stat} index={i} />
            ))}
          </div>

          <div className="mt-12 text-center text-green-200/70 text-xs max-w-lg mx-auto leading-relaxed border-t border-white/10 pt-6">
            * The metrics shown above are estimated ecological calculations
            based on standard bottle recycling averages and carbon/water
            conservation index references.
          </div>
        </div>
      </section>

      {/* --------------------------------- CTA --------------------------------- */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div
            data-aos="fade-up"
            className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <span
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-cta-dot"
                  style={{
                    left: `${(i * 37) % 100}%`,
                    top: `${(i * 53) % 100}%`,
                    animationDelay: `${(i % 10) * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">
              Ready to Start Recycling Smart?
            </h2>

            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto relative z-10">
              Join thousands of citizens making a difference. Start earning
              rewards today!
            </p>

            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-emerald-600 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg font-semibold hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] cursor-pointer"
              >
                Get Started Free
                <span className="inline-flex animate-arrow-nudge">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>

              <Link
                href="/signup"
                className="px-8 py-4 bg-emerald-800 text-white rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg font-semibold hover:scale-105 active:scale-95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] cursor-pointer"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- Footer ------------------------------- */}
      <footer className="relative z-10 bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div data-aos="fade-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="animate-spin-slow">
                  <Recycle className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">{t("common.appName")}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Smart bottle recycling system with AI verification and instant
                rewards.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: t("landing.featuresTitle"), href: "#features" },
                  {
                    label: t("landing.howItWorksTitle"),
                    href: "#how-it-works",
                  },
                  { label: "Pricing", href: "#pricing" },
                  { label: t("common.operationsControl"), href: "/overview" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About", href: "#" },
                  { label: "Careers", href: "#" },
                  { label: "Contact", href: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                  { label: "Security", href: "#" },
                ],
              },
            ].map((section, index) => (
              <div
                key={section.title}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="inline-block hover:text-white transition-all duration-200 hover:translate-x-1.5 animate-nav-item"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} EcoSnap. All rights reserved.
            </p>
            <a
              href="https://EcoSnap.link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
            >
              Powered by EcoSnap
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QRScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}

// ProgressLine: خط التقدم اللي بيكبر للعرض الكامل أول ما يظهر — AOS fade-right
function ProgressLine() {
  return (
    <div
      data-aos="fade-right"
      data-aos-duration="1500"
      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative"
      style={{ width: "100%", boxShadow: "0 0 20px rgba(16,185,129,0.6)" }}
    >
      <div className="absolute inset-0 bg-white/30 animate-shimmer-sweep" />
    </div>
  );
}

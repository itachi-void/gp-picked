"use client";

import { useState } from "react";
import {
  Zap,
  Star,
  Award,
  Crown,
  Shield,
  Sparkles,
  TrendingUp,
  Gift,
  Users,
} from "lucide-react";
import type { CitizenLevel } from "../../types/recyclehub";

const levelsData: CitizenLevel[] = [
  {
    level: 1,
    title: "Beginner",
    minPoints: 0,
    maxPoints: 499,
    benefits: ["Access to basic recycling", "10 points per kg"],
    color: "gray",
  },
  {
    level: 2,
    title: "Newcomer",
    minPoints: 500,
    maxPoints: 999,
    benefits: ["Basic recycling", "Badge unlocks", "Community access"],
    color: "blue",
  },
  {
    level: 3,
    title: "Contributor",
    minPoints: 1000,
    maxPoints: 2499,
    benefits: ["12 points per kg", "Priority pickup", "Monthly newsletter"],
    color: "green",
  },
  {
    level: 4,
    title: "Activist",
    minPoints: 2500,
    maxPoints: 4999,
    benefits: ["15 points per kg", "Exclusive events", "Refer bonuses"],
    color: "teal",
  },
  {
    level: 5,
    title: "Champion",
    minPoints: 5000,
    maxPoints: 9999,
    benefits: ["18 points per kg", "VIP support", "Special merchandise"],
    color: "purple",
  },
  {
    level: 6,
    title: "Hero",
    minPoints: 10000,
    maxPoints: 19999,
    benefits: ["20 points per kg", "Featured in leaderboard", "Monthly rewards"],
    color: "orange",
  },
  {
    level: 7,
    title: "Legend",
    minPoints: 20000,
    maxPoints: 49999,
    benefits: ["25 points per kg", "Exclusive badge", "Ambassador program"],
    color: "red",
  },
  {
    level: 8,
    title: "Master",
    minPoints: 50000,
    maxPoints: 99999,
    benefits: ["30 points per kg", "Platinum membership", "Direct line support"],
    color: "yellow",
  },
  {
    level: 9,
    title: "Grand Master",
    minPoints: 100000,
    maxPoints: 249999,
    benefits: ["35 points per kg", "Elite events", "Consulting opportunities"],
    color: "pink",
  },
  {
    level: 10,
    title: "Eco Guardian",
    minPoints: 250000,
    maxPoints: Infinity,
    benefits: ["40 points per kg", "Lifetime recognition", "Partnership programs"],
    color: "emerald",
  },
];

export default function Levels() {
  const [selectedLevel, setSelectedLevel] = useState<CitizenLevel | null>(null);

  const getLevelIcon = (level: number) => {
    if (level === 1) return Star;
    if (level <= 3) return Zap;
    if (level <= 5) return Award;
    if (level <= 7) return Shield;
    if (level <= 9) return Crown;
    return Sparkles;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<
      string,
      { bg: string; text: string; border: string; gradient: string }
    > = {
      gray: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        gradient: "from-gray-400 to-gray-500",
      },
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        gradient: "from-blue-400 to-blue-600",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
        gradient: "from-green-400 to-green-600",
      },
      teal: {
        bg: "bg-teal-100",
        text: "text-teal-700",
        border: "border-teal-300",
        gradient: "from-teal-400 to-teal-600",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-300",
        gradient: "from-purple-400 to-purple-600",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-300",
        gradient: "from-orange-400 to-orange-600",
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
        gradient: "from-red-400 to-red-600",
      },
      yellow: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
        gradient: "from-yellow-400 to-yellow-600",
      },
      pink: {
        bg: "bg-pink-100",
        text: "text-pink-700",
        border: "border-pink-300",
        gradient: "from-pink-400 to-pink-600",
      },
      emerald: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-300",
        gradient: "from-emerald-400 to-emerald-600",
      },
    };

    return colorMap[color] || colorMap.gray;
  };

  const stats = {
    totalLevels: levelsData.length,
    avgPointsRequired: Math.round(
      levelsData.reduce((sum, l) => sum + (l.minPoints + l.maxPoints) / 2, 0) /
        levelsData.length
    ),
    topLevel: levelsData[levelsData.length - 1].title,
    activeCitizens: 1247,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Levels & Progression</h1>
        <p className="text-gray-600 mt-1">
          Citizen ranking system and rewards tiers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Levels",
            value: stats.totalLevels,
            icon: TrendingUp,
            color: "purple",
          },
          {
            label: "Avg Points Required",
            value: stats.avgPointsRequired.toLocaleString(),
            icon: Zap,
            color: "blue",
          },
          {
            label: "Top Level",
            value: stats.topLevel,
            icon: Crown,
            color: "yellow",
          },
          {
            label: "Active Citizens",
            value: stats.activeCitizens.toLocaleString(),
            icon: Users,
            color: "green",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            purple: "bg-purple-100 text-purple-600",
            blue: "bg-blue-100 text-blue-600",
            yellow: "bg-yellow-100 text-yellow-600",
            green: "bg-green-100 text-green-600",
          };

          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Levels Roadmap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Progression Roadmap
        </h2>
        <div className="space-y-6">
          {levelsData.map((levelData, index) => {
            const Icon = getLevelIcon(levelData.level);
            const colors = getColorClasses(levelData.color);
            const isLast = index === levelsData.length - 1;

            return (
              <div key={levelData.level} className="relative">
                {/* Connector Line */}
                {!isLast && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* Level Card */}
                <div
                  className={`relative flex gap-6 p-6 border-2 rounded-xl hover:shadow-md transition-all cursor-pointer ${colors.border} ${colors.bg}`}
                  onClick={() => setSelectedLevel(levelData)}
                >
                  {/* Level Number Badge */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white border border-gray-300 rounded-full text-xs font-bold text-gray-700">
                      L{levelData.level}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {levelData.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {levelData.minPoints.toLocaleString()} -{" "}
                          {levelData.maxPoints === Infinity
                            ? "∞"
                            : levelData.maxPoints.toLocaleString()}{" "}
                          points
                        </p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                      {levelData.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <Gift className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">How Leveling Works</h3>
            <p className="text-emerald-50 mb-4">
              Citizens earn points by recycling bottles. As they accumulate points,
              they automatically progress through levels, unlocking better rewards,
              higher points multipliers, and exclusive benefits at each tier.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-emerald-100 mb-1">Earn Points</p>
                <p className="font-semibold">Recycle bottles to earn points</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-emerald-100 mb-1">Level Up</p>
                <p className="font-semibold">Automatically advance through levels</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-sm text-emerald-100 mb-1">Get Rewards</p>
                <p className="font-semibold">Unlock exclusive benefits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

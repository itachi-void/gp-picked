"use client";

import { useState } from "react";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Flame,
  Shield,
  Heart,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";
import type { Badge } from "../../types/recyclehub";

const badgesData: Badge[] = [
  {
    id: "badge-001",
    name: "First Step",
    description: "Recycle your first bottle",
    icon: "star",
    category: "milestone",
    requirement: "Recycle 1 bottle",
    rarity: "common",
    unlockedBy: ["CIT-12345", "CIT-12346", "CIT-12347"],
  },
  {
    id: "badge-002",
    name: "Century Club",
    description: "Recycle 100 bottles",
    icon: "trophy",
    category: "milestone",
    requirement: "Recycle 100 bottles",
    rarity: "rare",
    unlockedBy: ["CIT-12345", "CIT-12348"],
  },
  {
    id: "badge-003",
    name: "Eco Warrior",
    description: "Recycle 500 bottles",
    icon: "shield",
    category: "milestone",
    requirement: "Recycle 500 bottles",
    rarity: "epic",
    unlockedBy: ["CIT-12345"],
  },
  {
    id: "badge-004",
    name: "Legend",
    description: "Recycle 1000 bottles",
    icon: "crown",
    category: "milestone",
    requirement: "Recycle 1000 bottles",
    rarity: "legendary",
    unlockedBy: [],
  },
  {
    id: "badge-005",
    name: "Week Warrior",
    description: "Recycle every day for 7 days",
    icon: "flame",
    category: "streak",
    requirement: "7-day streak",
    rarity: "rare",
    unlockedBy: ["CIT-12345", "CIT-12346"],
  },
  {
    id: "badge-006",
    name: "Monthly Master",
    description: "Recycle every day for 30 days",
    icon: "zap",
    category: "streak",
    requirement: "30-day streak",
    rarity: "epic",
    unlockedBy: ["CIT-12345"],
  },
  {
    id: "badge-007",
    name: "Quick Start",
    description: "Recycle 10 bottles in first week",
    icon: "target",
    category: "recycling",
    requirement: "10 bottles in first week",
    rarity: "common",
    unlockedBy: ["CIT-12345", "CIT-12346", "CIT-12347", "CIT-12348"],
  },
  {
    id: "badge-008",
    name: "Community Hero",
    description: "Refer 10 friends",
    icon: "heart",
    category: "special",
    requirement: "Refer 10 friends",
    rarity: "epic",
    unlockedBy: ["CIT-12345"],
  },
  {
    id: "badge-009",
    name: "Early Adopter",
    description: "Joined in the first month",
    icon: "sparkles",
    category: "special",
    requirement: "Register in launch month",
    rarity: "legendary",
    unlockedBy: ["CIT-12345", "CIT-12346"],
  },
];

const iconMap: Record<string, any> = {
  star: Star,
  trophy: Trophy,
  shield: Shield,
  crown: Crown,
  flame: Flame,
  zap: Zap,
  target: Target,
  heart: Heart,
  sparkles: Sparkles,
};

export default function Badges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | Badge["category"]>("all");
  const [filterRarity, setFilterRarity] = useState<"all" | Badge["rarity"]>("all");

  const getRarityColor = (rarity: Badge["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "rare":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "epic":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "legendary":
        return "bg-yellow-100 text-yellow-700 border-yellow-400";
    }
  };

  const getRarityGradient = (rarity: Badge["rarity"]) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-500";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-yellow-400 to-amber-600";
    }
  };

  const getCategoryColor = (category: Badge["category"]) => {
    switch (category) {
      case "recycling":
        return "bg-green-100 text-green-700";
      case "streak":
        return "bg-orange-100 text-orange-700";
      case "milestone":
        return "bg-blue-100 text-blue-700";
      case "special":
        return "bg-purple-100 text-purple-700";
    }
  };

  const filteredBadges = badgesData.filter((badge) => {
    const matchesSearch =
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || badge.category === filterCategory;
    const matchesRarity = filterRarity === "all" || badge.rarity === filterRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const stats = {
    total: badgesData.length,
    common: badgesData.filter((b) => b.rarity === "common").length,
    rare: badgesData.filter((b) => b.rarity === "rare").length,
    epic: badgesData.filter((b) => b.rarity === "epic").length,
    legendary: badgesData.filter((b) => b.rarity === "legendary").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Badges & Achievements</h1>
        <p className="text-gray-600 mt-1">
          Manage and track user achievements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Total Badges", value: stats.total, color: "gray" },
          { label: "Common", value: stats.common, color: "gray" },
          { label: "Rare", value: stats.rare, color: "blue" },
          { label: "Epic", value: stats.epic, color: "purple" },
          { label: "Legendary", value: stats.legendary, color: "yellow" },
        ].map((stat) => {
          const colorMap: Record<string, string> = {
            gray: "bg-gray-100 text-gray-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            yellow: "bg-yellow-100 text-yellow-600",
          };

          return (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Categories</option>
          <option value="recycling">Recycling</option>
          <option value="streak">Streak</option>
          <option value="milestone">Milestone</option>
          <option value="special">Special</option>
        </select>
        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Rarities</option>
          <option value="common">Common</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const Icon = iconMap[badge.icon] || Award;
          const isUnlocked = badge.unlockedBy && badge.unlockedBy.length > 0;

          return (
            <div
              key={badge.id}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition-all ${getRarityColor(
                badge.rarity
              )}`}
            >
              <div
                className={`h-2 bg-gradient-to-r ${getRarityGradient(badge.rarity)}`}
              />
              <div className="p-6">
                {/* Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-4 bg-gradient-to-br ${getRarityGradient(
                      badge.rarity
                    )} rounded-xl`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getCategoryColor(
                        badge.category
                      )}`}
                    >
                      {badge.category}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium capitalize ${getRarityColor(
                        badge.rarity
                      )}`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {badge.description}
                </p>
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="text-xs text-gray-600 mb-1">Requirement:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {badge.requirement}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Unlocked By</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {badge.unlockedBy?.length || 0}
                    </p>
                  </div>
                  {isUnlocked && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">Achieved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

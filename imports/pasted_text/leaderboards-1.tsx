"use client";

import { useState } from "react";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Medal,
  Award,
  Zap,
  Filter,
  Calendar,
} from "lucide-react";
import type { LeaderboardEntry } from "../../types/recyclehub";

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    citizenId: "CIT-12345",
    citizenName: "Ahmed Hassan",
    points: 15420,
    bottlesRecycled: 1542,
    level: 12,
    badges: [],
    trend: "same",
  },
  {
    rank: 2,
    citizenId: "CIT-12346",
    citizenName: "Fatma Mohamed",
    points: 14890,
    bottlesRecycled: 1489,
    level: 11,
    badges: [],
    trend: "up",
  },
  {
    rank: 3,
    citizenId: "CIT-12347",
    citizenName: "Omar Ali",
    points: 13750,
    bottlesRecycled: 1375,
    level: 11,
    badges: [],
    trend: "up",
  },
  {
    rank: 4,
    citizenId: "CIT-12348",
    citizenName: "Sara Mahmoud",
    points: 12200,
    bottlesRecycled: 1220,
    level: 10,
    badges: [],
    trend: "down",
  },
  {
    rank: 5,
    citizenId: "CIT-12349",
    citizenName: "Karim Youssef",
    points: 11580,
    bottlesRecycled: 1158,
    level: 10,
    badges: [],
    trend: "up",
  },
  {
    rank: 6,
    citizenId: "CIT-12350",
    citizenName: "Nour Ibrahim",
    points: 10920,
    bottlesRecycled: 1092,
    level: 9,
    badges: [],
    trend: "same",
  },
  {
    rank: 7,
    citizenId: "CIT-12351",
    citizenName: "Hassan Ahmed",
    points: 10340,
    bottlesRecycled: 1034,
    level: 9,
    badges: [],
    trend: "up",
  },
  {
    rank: 8,
    citizenId: "CIT-12352",
    citizenName: "Amira Samir",
    points: 9850,
    bottlesRecycled: 985,
    level: 8,
    badges: [],
    trend: "down",
  },
  {
    rank: 9,
    citizenId: "CIT-12353",
    citizenName: "Mohamed Ali",
    points: 9420,
    bottlesRecycled: 942,
    level: 8,
    badges: [],
    trend: "up",
  },
  {
    rank: 10,
    citizenId: "CIT-12354",
    citizenName: "Layla Khaled",
    points: 8970,
    bottlesRecycled: 897,
    level: 8,
    badges: [],
    trend: "same",
  },
];

export default function Leaderboards() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "alltime">("alltime");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-amber-500";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-r from-amber-500 to-orange-600";
      default:
        return "bg-gray-100";
    }
  };

  const getTrendIcon = (trend: LeaderboardEntry["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "same":
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const topThree = mockLeaderboard.slice(0, 3);
  const restOfLeaders = mockLeaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboards</h1>
          <p className="text-gray-600 mt-1">
            Top recyclers and community champions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              timeframe === "weekly"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe("monthly")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              timeframe === "monthly"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe("alltime")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              timeframe === "alltime"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topThree.map((entry) => (
          <div
            key={entry.citizenId}
            className={`relative overflow-hidden rounded-2xl shadow-lg ${
              entry.rank === 1 ? "md:order-2 transform md:scale-110" : ""
            } ${entry.rank === 2 ? "md:order-1" : ""} ${
              entry.rank === 3 ? "md:order-3" : ""
            }`}
          >
            <div className={`h-2 ${getRankBg(entry.rank)}`} />
            <div className="bg-white p-6">
              {/* Rank Badge */}
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${getRankBg(
                    entry.rank
                  )}`}
                >
                  {getRankIcon(entry.rank)}
                </div>
              </div>

              {/* Name */}
              <h3 className="text-center text-lg font-bold text-gray-900 mb-1">
                {entry.citizenName}
              </h3>
              <p className="text-center text-sm text-gray-600 mb-4">
                Level {entry.level}
              </p>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <span className="text-sm text-gray-600">Points</span>
                  <span className="font-bold text-emerald-600">
                    {entry.points.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Bottles</span>
                  <span className="font-bold text-blue-600">
                    {entry.bottlesRecycled.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Trend */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {getTrendIcon(entry.trend)}
                <span className="text-sm text-gray-600">
                  {entry.trend === "up"
                    ? "Rising"
                    : entry.trend === "down"
                    ? "Falling"
                    : "Stable"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Citizen
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bottles Recycled
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {restOfLeaders.map((entry, index) => (
                <tr
                  key={entry.citizenId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-gray-700">
                          #{entry.rank}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {entry.citizenName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.citizenName}
                        </p>
                        <p className="text-sm text-gray-500">{entry.citizenId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900">
                        Level {entry.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">
                      {entry.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {entry.bottlesRecycled.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(entry.trend)}
                      <span
                        className={`text-sm font-medium ${
                          entry.trend === "up"
                            ? "text-green-600"
                            : entry.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {entry.trend === "up"
                          ? "Rising"
                          : entry.trend === "down"
                          ? "Falling"
                          : "Stable"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Participants",
            value: "1,247",
            icon: Trophy,
            color: "purple",
          },
          {
            label: "Avg Points",
            value: "8,542",
            icon: TrendingUp,
            color: "blue",
          },
          {
            label: "Top Score",
            value: "15,420",
            icon: Crown,
            color: "yellow",
          },
          {
            label: "Active This Week",
            value: "892",
            icon: Zap,
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
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ExportPerformanceDialog } from "../../components/ExportPerformanceDialog";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Users,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  LineChart as RechartsLine,
  BarChart,
  PieChart as RechartsPie,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Animated Counter
function AnimatedCounter({
  end,
  duration = 2,
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
    let startTime: number;
    let animationFrame: number;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easedProgress = easeOutExpo(progress);

      setCount(Math.floor(easedProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
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

// Performance data
const weeklyData = [
  {
    id: "mon",
    day: "Mon",
    collected: 245,
    processed: 230,
    revenue: 1850,
  },
  {
    id: "tue",
    day: "Tue",
    collected: 312,
    processed: 298,
    revenue: 2340,
  },
  {
    id: "wed",
    day: "Wed",
    collected: 278,
    processed: 265,
    revenue: 2100,
  },
  {
    id: "thu",
    day: "Thu",
    collected: 398,
    processed: 375,
    revenue: 2980,
  },
  {
    id: "fri",
    day: "Fri",
    collected: 445,
    processed: 420,
    revenue: 3350,
  },
  {
    id: "sat",
    day: "Sat",
    collected: 520,
    processed: 495,
    revenue: 3920,
  },
  {
    id: "sun",
    day: "Sun",
    collected: 380,
    processed: 360,
    revenue: 2850,
  },
];

const monthlyData = [
  {
    id: "jan",
    month: "Jan",
    efficiency: 85,
    satisfaction: 92,
    revenue: 45000,
  },
  {
    id: "feb",
    month: "Feb",
    efficiency: 88,
    satisfaction: 90,
    revenue: 48000,
  },
  {
    id: "mar",
    month: "Mar",
    efficiency: 92,
    satisfaction: 94,
    revenue: 52000,
  },
  {
    id: "apr",
    month: "Apr",
    efficiency: 89,
    satisfaction: 91,
    revenue: 49500,
  },
  {
    id: "may",
    month: "May",
    efficiency: 94,
    satisfaction: 95,
    revenue: 55000,
  },
  {
    id: "jun",
    month: "Jun",
    efficiency: 96,
    satisfaction: 96,
    revenue: 58000,
  },
];

const categoryData = [
  { id: "glass", name: "Glass", value: 35, color: "#10B981" },
  {
    id: "plastic",
    name: "Plastic",
    value: 28,
    color: "#3B82F6",
  },
  { id: "metal", name: "Metal", value: 22, color: "#8B5CF6" },
  { id: "paper", name: "Paper", value: 15, color: "#F59E0B" },
];

const radarData = [
  { id: "efficiency", metric: "Efficiency", value: 94 },
  { id: "quality", metric: "Quality", value: 88 },
  { id: "speed", metric: "Speed", value: 92 },
  { id: "satisfaction", metric: "Satisfaction", value: 96 },
  { id: "safety", metric: "Safety", value: 90 },
  { id: "innovation", metric: "Innovation", value: 85 },
];

export default function Performance() {
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter"
  >("week");
  const [selectedMetric, setSelectedMetric] = useState<
    "all" | "collection" | "processing" | "revenue"
  >("all");
  const [trendMetric, setTrendMetric] = useState<"efficiency" | "satisfaction" | "both">("both");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 200));
    setIsRefreshing(false);
  };

  // Scale weekly values based on selected time range so the chart reflects scope
  const rangeMultiplier = timeRange === "week" ? 1 : timeRange === "month" ? 4.3 : 13;
  const displayedTrendData = weeklyData.map((d) => ({
    ...d,
    collected: Math.round(d.collected * rangeMultiplier),
    processed: Math.round(d.processed * rangeMultiplier),
    revenue: Math.round(d.revenue * rangeMultiplier),
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Performance Metrics
          </h1>
          <p className="text-gray-600 mt-1">
            Track system performance and KPIs
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as any)
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </motion.button>
          <motion.button
            onClick={() => setIsExportDialogOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            label: "Collection Rate",
            value: 94,
            suffix: "%",
            icon: Package,
            trend: "+8%",
            trendUp: true,
            color: "green",
            target: 95,
          },
          {
            label: "Processing Efficiency",
            value: 89,
            suffix: "%",
            icon: Activity,
            trend: "+5%",
            trendUp: true,
            color: "blue",
            target: 90,
          },
          {
            label: "Driver Performance",
            value: 92,
            suffix: "%",
            icon: Truck,
            trend: "+3%",
            trendUp: true,
            color: "purple",
            target: 95,
          },
          {
            label: "Customer Satisfaction",
            value: 96,
            suffix: "%",
            icon: Award,
            trend: "+2%",
            trendUp: true,
            color: "orange",
            target: 98,
          },
        ].map((kpi, index) => {
          const Icon = kpi.icon;
          const colorMap: Record<
            string,
            { bg: string; text: string; progress: string }
          > = {
            green: {
              bg: "bg-green-100",
              text: "text-green-600",
              progress: "bg-green-600",
            },
            blue: {
              bg: "bg-blue-100",
              text: "text-blue-600",
              progress: "bg-blue-600",
            },
            purple: {
              bg: "bg-purple-100",
              text: "text-purple-600",
              progress: "bg-purple-600",
            },
            orange: {
              bg: "bg-orange-100",
              text: "text-orange-600",
              progress: "bg-orange-600",
            },
          };

          return (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              whileHover={{
                y: -5,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${colorMap[kpi.color].bg} ${colorMap[kpi.color].text}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`flex items-center text-sm font-medium ${kpi.trendUp ? "text-green-600" : "text-red-600"}`}
                >
                  {kpi.trendUp ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {kpi.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-3">
                <AnimatedCounter
                  end={kpi.value}
                  suffix={kpi.suffix}
                />
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress to target</span>
                  <span>{kpi.target}% target</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(kpi.value / kpi.target) * 100}%`,
                    }}
                    transition={{
                      duration: 1,
                      delay: index * 0.1,
                    }}
                    className={`h-2 rounded-full ${colorMap[kpi.color].progress}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Weekly Performance Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Weekly Performance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Collection vs Processing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayedTrendData}>
              <defs>
                <linearGradient
                  id="perfColorCollected"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#10B981"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#10B981"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="perfColorProcessed"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#3B82F6"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#3B82F6"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
              />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#perfColorCollected)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="processed"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#perfColorProcessed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Trend
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Weekly revenue analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLine data={displayedTrendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
              />
              <XAxis dataKey="day" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </RechartsLine>
          </ResponsiveContainer>
        </motion.div>

        {/* Material Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Material Distribution
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                By category
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {categoryData.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-gray-700">
                  {cat.name}: {cat.value}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Radar */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Overview
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Multi-dimensional analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="metric"
                stroke="#6B7280"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                stroke="#6B7280"
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Monthly Trends */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Trends
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Efficiency, satisfaction & revenue
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setTrendMetric(trendMetric === "efficiency" ? "both" : "efficiency")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                trendMetric === "efficiency"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              Efficiency
            </motion.button>
            <motion.button
              onClick={() => setTrendMetric(trendMetric === "satisfaction" ? "both" : "satisfaction")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                trendMetric === "satisfaction"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Satisfaction
            </motion.button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
            />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            {(trendMetric === "efficiency" || trendMetric === "both") && (
              <Bar
                dataKey="efficiency"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
              />
            )}
            {(trendMetric === "satisfaction" || trendMetric === "both") && (
              <Bar
                dataKey="satisfaction"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Top Performer",
            value: "Route #12",
            description: "98% efficiency this week",
            icon: Award,
            color: "green",
          },
          {
            title: "Most Improved",
            value: "Center East",
            description: "+15% from last month",
            icon: TrendingUp,
            color: "blue",
          },
          {
            title: "Needs Attention",
            value: "Route #5",
            description: "Below target efficiency",
            icon: AlertCircle,
            color: "orange",
          },
        ].map((insight, index) => {
          const Icon = insight.icon;
          const colorMap: Record<
            string,
            { bg: string; text: string; border: string }
          > = {
            green: {
              bg: "bg-green-50",
              text: "text-green-700",
              border: "border-green-200",
            },
            blue: {
              bg: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-200",
            },
            orange: {
              bg: "bg-orange-50",
              text: "text-orange-700",
              border: "border-orange-200",
            },
          };

          return (
            <motion.div
              key={insight.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 ${colorMap[insight.color].bg} ${colorMap[insight.color].border}`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorMap[insight.color].text} bg-white mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {insight.title}
              </h3>
              <p className="text-xl font-bold text-gray-900 mb-2">
                {insight.value}
              </p>
              <p className="text-sm text-gray-600">
                {insight.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Export Dialog */}
      <ExportPerformanceDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={[
          // Mock performance data for export
          {
            id: "DRV-001",
            name: "Ahmed Hassan",
            status: "active",
            completedTrips: 248,
            earnings: 12450,
            rating: 4.8,
            onTimePercentage: 96,
            fuelEfficiency: 8.5,
            currentRoute: "Route #12",
            vehicleNumber: "VEH-101",
            joinDate: "2025-01-15",
          },
          {
            id: "DRV-002",
            name: "Mohammed Ali",
            status: "active",
            completedTrips: 312,
            earnings: 15680,
            rating: 4.9,
            onTimePercentage: 98,
            fuelEfficiency: 9.2,
            currentRoute: "Route #8",
            vehicleNumber: "VEH-102",
            joinDate: "2024-11-20",
          },
          // Add more mock data as needed
        ]}
      />
    </div>
  );
}
"use client";

import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  MapPin,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  PieChart,
  LineChart,
  FileSpreadsheet,
  Printer,
  Truck,
  Sparkles,
} from "lucide-react";
import {
  exportToCSV,
  exportToPDF,
} from "@/app/utils/exportUtils";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";
import type { FilterOptions } from "../../components/FilterDialog";
import { FilterDialog } from "../../components/FilterDialog";
import { ExportDialog } from "../../components/ExportDialog";
import { DetailsDialog } from "../../components/DetailsDialog";
import { useRole } from "@/app/contexts/RoleContext";

// Sample Data
const monthlyData = [
  {
    month: "Jan",
    collections: 4200,
    revenue: 8400,
    recycled: 3900,
    efficiency: 92,
  },
  {
    month: "Feb",
    collections: 4800,
    revenue: 9600,
    recycled: 4500,
    efficiency: 94,
  },
  {
    month: "Mar",
    collections: 5200,
    revenue: 10400,
    recycled: 4900,
    efficiency: 94,
  },
  {
    month: "Apr",
    collections: 5800,
    revenue: 11600,
    recycled: 5500,
    efficiency: 95,
  },
  {
    month: "May",
    collections: 6200,
    revenue: 12400,
    recycled: 5900,
    efficiency: 95,
  },
  {
    month: "Jun",
    collections: 6800,
    revenue: 13600,
    recycled: 6500,
    efficiency: 96,
  },
  {
    month: "Jul",
    collections: 7200,
    revenue: 14400,
    recycled: 6900,
    efficiency: 96,
  },
  {
    month: "Aug",
    collections: 7600,
    revenue: 15200,
    recycled: 7300,
    efficiency: 96,
  },
  {
    month: "Sep",
    collections: 8100,
    revenue: 16200,
    recycled: 7800,
    efficiency: 96,
  },
  {
    month: "Oct",
    collections: 8500,
    revenue: 17000,
    recycled: 8200,
    efficiency: 97,
  },
  {
    month: "Nov",
    collections: 9200,
    revenue: 18400,
    recycled: 8900,
    efficiency: 97,
  },
  {
    month: "Dec",
    collections: 9800,
    revenue: 19600,
    recycled: 9500,
    efficiency: 97,
  },
];

const predictiveData = [
  ...monthlyData.slice(6).map((item, index) => ({
    ...item,
    key: `actual-${index}`, // Add unique key
  })), // Last 6 months of actual data
  {
    month: "Jan (F)",
    collections: 10200,
    revenue: 20400,
    recycled: 9800,
    efficiency: 97,
    isForecast: true,
    key: "forecast-0",
  },
  {
    month: "Feb (F)",
    collections: 10800,
    revenue: 21600,
    recycled: 10400,
    efficiency: 98,
    isForecast: true,
    key: "forecast-1",
  },
  {
    month: "Mar (F)",
    collections: 11500,
    revenue: 23000,
    recycled: 11100,
    efficiency: 98,
    isForecast: true,
    key: "forecast-2",
  },
];

const categoryData = [
  { name: "Plastic", value: 35, color: "#3B82F6" },
  { name: "Glass", value: 25, color: "#10B981" },
  { name: "Metal", value: 20, color: "#F59E0B" },
  { name: "Paper", value: 15, color: "#8B5CF6" },
  { name: "Other", value: 5, color: "#6B7280" },
];

const performanceData = [
  { category: "Collection", score: 95 },
  { category: "Processing", score: 88 },
  { category: "Distribution", score: 92 },
  { category: "Quality", score: 90 },
  { category: "Efficiency", score: 94 },
  { category: "Sustainability", score: 96 },
];

const regionData = [
  { region: "North", bottles: 2400, centers: 8, drivers: 24 },
  { region: "South", bottles: 2100, centers: 6, drivers: 18 },
  { region: "East", bottles: 2800, centers: 10, drivers: 30 },
  { region: "West", bottles: 2200, centers: 7, drivers: 21 },
  {
    region: "Central",
    bottles: 3100,
    centers: 12,
    drivers: 36,
  },
];

const topDrivers = [
  {
    id: 1,
    name: "Ahmed Hassan",
    collections: 1240,
    revenue: 2480,
    rating: 4.9,
    badge: "gold",
  },
  {
    id: 2,
    name: "Mohamed Ali",
    collections: 1180,
    revenue: 2360,
    rating: 4.8,
    badge: "gold",
  },
  {
    id: 3,
    name: "Sara Ahmed",
    collections: 1120,
    revenue: 2240,
    rating: 4.7,
    badge: "silver",
  },
  {
    id: 4,
    name: "Omar Khaled",
    collections: 1050,
    revenue: 2100,
    rating: 4.7,
    badge: "silver",
  },
  {
    id: 5,
    name: "Fatima Said",
    collections: 980,
    revenue: 1960,
    rating: 4.6,
    badge: "bronze",
  },
];

const recentActivities = [
  {
    id: 1,
    action: "New Collection",
    user: "Ahmed Hassan",
    location: "North District",
    time: "2 min ago",
    status: "success",
  },
  {
    id: 2,
    action: "Route Completed",
    user: "Mohamed Ali",
    location: "East District",
    time: "15 min ago",
    status: "success",
  },
  {
    id: 3,
    action: "Maintenance Alert",
    user: "System",
    location: "Central Hub",
    time: "1 hour ago",
    status: "warning",
  },
  {
    id: 4,
    action: "Quality Check",
    user: "Sara Ahmed",
    location: "South Center",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: 5,
    action: "Inventory Update",
    user: "System",
    location: "West Warehouse",
    time: "3 hours ago",
    status: "info",
  },
];

export default function Analytics() {
  const { role: currentRole } = useRole();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("year");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] =
    useState<any>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setIsRefreshing(false);
  };

  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const rangeMonths: Record<string, number> = {
    week: 1,
    month: 1,
    quarter: 3,
    year: 12,
  };
  const displayedMonthlyData = monthlyData.slice(-rangeMonths[timeRange]);
  const filteredRegionData = activeFilters?.regions?.length
    ? regionData.filter((r: any) =>
        activeFilters.regions!.some((sel) =>
          (r.region || r.name || "").toLowerCase().includes(sel.toLowerCase())
        )
      )
    : regionData;

  const stats = [
    {
      title: "Total Collections",
      value: "85,240",
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    ...(currentRole === "admin"
      ? [
          {
            title: "Total Revenue",
            value: "$170,480",
            change: "+18.2%",
            trend: "up",
            icon: DollarSign,
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-600",
          },
        ]
      : []),
    {
      title: "Active Users",
      value: "12,456",
      change: "+8.7%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Recycling Rate",
      value: "96.4%",
      change: "+2.1%",
      trend: "up",
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Active Routes",
      value: "234",
      change: "-3.2%",
      trend: "down",
      icon: MapPin,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      change: "-15.3%",
      trend: "up",
      icon: Clock,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
    },
  ];

  if (currentRole === "driver" || currentRole === "citizen") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {currentRole === "driver" ? (
            <Truck className="w-10 h-10 text-gray-400" />
          ) : (
            <Users className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Analytics Access Restricted
        </h2>
        <p className="text-gray-500 max-w-md">
          The analytics dashboard is available for Admin and
          Manager roles. Please check your personalized overview
          for your relevant statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            Advanced Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              exportToCSV(monthlyData, "Analytics_Report")
            }
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              exportToPDF("root", "Analytics_Dashboard_Report")
            }
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Advanced Export
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group cursor-pointer"
            >
              {/* Background Gradient */}
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:opacity-10 transition-opacity`}
              />

              {/* Icon */}
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}
              >
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-sm text-gray-600 font-medium">
                {stat.title}
              </h3>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collections & Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-600" />
                Collections & Revenue Trend
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Monthly performance overview
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={displayedMonthlyData}>
              <defs>
                <linearGradient
                  id="collectionsGradient"
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
                <linearGradient
                  id="revenueGradient"
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
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="collections"
                fill="url(#collectionsGradient)"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Collections"
              />
              {currentRole === "admin" && (
                <Bar
                  dataKey="revenue"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                  name="Revenue ($)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Material Distribution
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Breakdown by material type
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${value}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
                <span className="text-sm text-gray-500 ml-auto">
                  {item.value}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Predictive Insights (New Phase 4 Feature) */}
      {(currentRole === "admin" ||
        currentRole === "manager") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-emerald-500" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-500" />
                AI Predictive Insights
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                3-Month forecast based on historical trends and
                seasonal modifiers
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-3 max-w-sm">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                AI Analytics projects a{" "}
                <span className="font-bold">17.3% surge</span>{" "}
                in overall collections by Q1. Recommendation:
                Pre-allocate 2 additional trucks to the Central
                Hub to handle peak volume.
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={predictiveData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                key="bar-collections"
                dataKey="collections"
                name="Actual Collections"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={30}
              />
              <Line
                key="line-revenue"
                type="monotone"
                dataKey="revenue"
                name="Projected Revenue ($)"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                strokeDasharray="5 5"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Performance Radar & Regional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Performance Metrics
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Multi-dimensional analysis
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="category"
                stroke="#6b7280"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                stroke="#6b7280"
              />
              <Radar
                name="Performance Score"
                dataKey="score"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Regional Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Regional Performance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Analysis by geographic region
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={filteredRegionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis dataKey="region" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="bottles"
                fill="#F59E0B"
                radius={[8, 8, 0, 0]}
                name="Bottles Collected"
              />
              <Bar
                dataKey="centers"
                fill="#8B5CF6"
                radius={[8, 8, 0, 0]}
                name="Centers"
              />
              <Bar
                dataKey="drivers"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
                name="Drivers"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Efficiency & Recycling Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Efficiency & Quality Trends
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Year-over-year performance improvement
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={displayedMonthlyData}>
            <defs>
              <linearGradient
                id="efficiencyGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#10B981"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="#10B981"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
            />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis domain={[85, 100]} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#efficiencyGradient)"
              strokeWidth={3}
              name="Efficiency Rate (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Performers & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Drivers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Top Performers
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Leading drivers this month
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topDrivers.map((driver, index) => (
              <motion.div
                key={driver.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ x: 5, scale: 1.02 }}
                onClick={() => setSelectedDriver(driver)}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full font-bold text-gray-700">
                  #{index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {driver.name}
                    </h4>
                    {driver.badge === "gold" && (
                      <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {driver.badge === "silver" && (
                      <div className="w-5 h-5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {driver.badge === "bronze" && (
                      <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {driver.collections.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />$
                      {driver.revenue.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      ⭐ {driver.rating}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-600" />
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Live system updates
              </p>
            </div>
            <motion.button
              onClick={() => startTransition(() => navigate("/dashboard/activity-log"))}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View All
            </motion.button>
          </div>

          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const statusColors = {
                success:
                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                warning:
                  "bg-yellow-50 text-yellow-700 border-yellow-200",
                info: "bg-blue-50 text-blue-700 border-blue-200",
              };

              const statusIcons = {
                success: CheckCircle,
                warning: AlertCircle,
                info: Activity,
              };

              const StatusIcon =
                statusIcons[
                  activity.status as keyof typeof statusIcons
                ];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedActivity(activity)}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${statusColors[activity.status as keyof typeof statusColors]}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {activity.action}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <Package className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Collection Goal
          </h3>
          <p className="text-3xl font-bold mb-2">87%</p>
          <p className="text-blue-100 text-sm">
            Target: 100,000 bottles
          </p>
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "87%" }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="bg-white h-2 rounded-full"
            />
          </div>
        </motion.div>

        {currentRole === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
              animate={{ rotate: -360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <TrendingUp className="w-10 h-10 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Revenue Growth
            </h3>
            <p className="text-3xl font-bold mb-2">+18.2%</p>
            <p className="text-emerald-100 text-sm">
              Compared to last period
            </p>
            <div className="mt-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              <span className="text-sm font-medium">
                $28,400 increase
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <Users className="w-10 h-10 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            User Engagement
          </h3>
          <p className="text-3xl font-bold mb-2">94.8%</p>
          <p className="text-purple-100 text-sm">
            Active user retention rate
          </p>
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              11,806 active users
            </span>
          </div>
        </motion.div>
      </div>

      {/* Dialogs */}
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleApplyFilters}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <DetailsDialog
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        type="driver"
        data={selectedDriver}
      />

      <DetailsDialog
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        type="activity"
        data={selectedActivity}
      />
    </div>
  );
}
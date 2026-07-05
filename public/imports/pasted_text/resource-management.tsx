"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  Download,
  Filter,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  MapPin,
  Wrench,
  CheckCircle,
  Clock,
  CircleX,
  FileText,
  BarChart3,
  Briefcase,
} from "lucide-react";

// Animated Counter Component
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

const ASSETS_DATA = [
  { id: "AST-001", name: "Collection Truck #1", category: "Vehicle", status: "In Use", location: "Downtown Center", lastMaintenance: "2026-02-10", statusColor: "green", filterKey: "active" },
  { id: "AST-002", name: "Sorting Machine A", category: "Equipment", status: "Active", location: "North Center", lastMaintenance: "2026-01-15", statusColor: "blue", filterKey: "active" },
  { id: "AST-003", name: "Compactor Unit", category: "Equipment", status: "Maintenance", location: "East Center", lastMaintenance: "2026-03-01", statusColor: "orange", filterKey: "maintenance" },
  { id: "AST-004", name: "Recycling Bin Set", category: "Infrastructure", status: "Available", location: "West Center", lastMaintenance: "2026-02-20", statusColor: "purple", filterKey: "available" },
  { id: "AST-005", name: "Collection Truck #2", category: "Vehicle", status: "In Use", location: "South Center", lastMaintenance: "2026-02-28", statusColor: "green", filterKey: "active" },
];

const exportAssetsCSV = (rows: typeof ASSETS_DATA) => {
  const header = "ID,Name,Category,Status,Location,Last Maintenance\n";
  const body = rows
    .map((r) => [r.id, r.name, r.category, r.status, r.location, r.lastMaintenance].join(","))
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resources-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function Resources() {
  const [activeTab, setActiveTab] = useState<
    "assets" | "hr" | "financial"
  >("assets");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredAssets = ASSETS_DATA.filter((a) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesQuery =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q);
    const matchesFilter =
      selectedFilter === "all" || a.filterKey === selectedFilter;
    return matchesQuery && matchesFilter;
  });

  const handleExport = () => exportAssetsCSV(filteredAssets);
  const handleAddResource = () =>
    alert("Add Resource: open the Add Resource dialog (coming next).");
  const handleEditAsset = (id: string) => alert(`Edit asset ${id}`);
  const handleMoreAsset = (id: string) => alert(`More actions for ${id}`);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Resource Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage assets, HR, and financial resources
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={handleExport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
            <motion.button
              onClick={handleAddResource}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="border-b border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "assets",
              label: "Asset Tracking",
              icon: Package,
            },
            { id: "hr", label: "HR Integration", icon: Users },
            {
              id: "financial",
              label: "Financial Management",
              icon: DollarSign,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5 inline-block mr-2" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                    layoutId="activeTab"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Asset Tracking Section */}
      <AnimatePresence mode="wait">
        {activeTab === "assets" && (
          <motion.div
            key="assets"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Assets",
                  value: 248,
                  icon: Package,
                  color: "green",
                  trend: "+12%",
                  trendUp: true,
                },
                {
                  label: "In Use",
                  value: 187,
                  icon: CheckCircle,
                  color: "blue",
                  trend: "75.4%",
                  subtitle: "utilization",
                },
                {
                  label: "Maintenance",
                  value: 8,
                  icon: Wrench,
                  color: "orange",
                  trend: "3.2%",
                  subtitle: "of total",
                },
                {
                  label: "Available",
                  value: 53,
                  icon: CheckCircle,
                  color: "purple",
                  trend: "21.4%",
                  subtitle: "ready to use",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  green: "bg-green-100 text-green-600",
                  blue: "bg-blue-100 text-blue-600",
                  orange: "bg-orange-100 text-orange-600",
                  purple: "bg-purple-100 text-purple-600",
                };

                return (
                  <motion.div
                    key={stat.label}
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
                        className={`p-3 rounded-lg ${colorMap[stat.color]}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {stat.trendUp && (
                        <span className="flex items-center text-sm text-green-600 font-medium">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      <AnimatedCounter end={stat.value} />
                    </p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 mt-2">
                        {stat.trend} {stat.subtitle}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Search and Filters */}
            <motion.div
              variants={itemVariants}
              className="flex gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) =>
                  setSelectedFilter(e.target.value)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="available">Available</option>
              </select>
            </motion.div>

            {/* Assets Table */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Asset Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Maintenance
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAssets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No assets match your filters.
                        </td>
                      </tr>
                    )}
                    {filteredAssets.map((asset, index) => (
                      <motion.tr
                        key={asset.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: "#F9FAFB",
                        }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {asset.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {asset.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                            {asset.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${
                              asset.statusColor === "green"
                                ? "bg-green-100 text-green-700"
                                : asset.statusColor === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : asset.statusColor ===
                                      "orange"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                asset.statusColor === "green"
                                  ? "bg-green-600"
                                  : asset.statusColor === "blue"
                                    ? "bg-blue-600"
                                    : asset.statusColor ===
                                        "orange"
                                      ? "bg-orange-600"
                                      : "bg-purple-600"
                              }`}
                            />
                            {asset.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {asset.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {asset.lastMaintenance}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              onClick={() => handleEditAsset(asset.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleMoreAsset(asset.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HR Integration Section */}
      <AnimatePresence mode="wait">
        {activeTab === "hr" && (
          <motion.div
            key="hr"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Employees",
                  value: 142,
                  icon: Users,
                  color: "green",
                  subtitle: "Across all centers",
                },
                {
                  label: "On Duty Today",
                  value: 98,
                  icon: CheckCircle,
                  color: "blue",
                  subtitle: "69% attendance",
                },
                {
                  label: "Pending Approvals",
                  value: 5,
                  icon: Clock,
                  color: "orange",
                  subtitle: "Requires action",
                },
                {
                  label: "New Hires",
                  value: 12,
                  icon: TrendingUp,
                  color: "purple",
                  subtitle: "This month",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  green: "bg-green-100 text-green-600",
                  blue: "bg-blue-100 text-blue-600",
                  orange: "bg-orange-100 text-orange-600",
                  purple: "bg-purple-100 text-purple-600",
                };

                return (
                  <motion.div
                    key={stat.label}
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
                        className={`p-3 rounded-lg ${colorMap[stat.color]}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      <AnimatedCounter end={stat.value} />
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stat.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Employee Table */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Employee Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      {
                        id: "EMP-001",
                        name: "John Smith",
                        department: "Collections",
                        position: "Driver",
                        status: "On Duty",
                        shift: "Morning",
                        statusColor: "green",
                      },
                      {
                        id: "EMP-002",
                        name: "Sarah Johnson",
                        department: "Sorting",
                        position: "Operator",
                        status: "On Duty",
                        shift: "Morning",
                        statusColor: "green",
                      },
                      {
                        id: "EMP-003",
                        name: "Mike Wilson",
                        department: "Transport",
                        position: "Coordinator",
                        status: "Off Duty",
                        shift: "Evening",
                        statusColor: "gray",
                      },
                      {
                        id: "EMP-004",
                        name: "Emily Davis",
                        department: "Maintenance",
                        position: "Technician",
                        status: "On Leave",
                        shift: "Day",
                        statusColor: "orange",
                      },
                      {
                        id: "EMP-005",
                        name: "David Brown",
                        department: "Collections",
                        position: "Driver",
                        status: "On Duty",
                        shift: "Afternoon",
                        statusColor: "green",
                      },
                    ].map((employee, index) => (
                      <motion.tr
                        key={employee.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: "#F9FAFB",
                        }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {employee.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {employee.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                            {employee.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {employee.position}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${
                              employee.statusColor === "green"
                                ? "bg-green-100 text-green-700"
                                : employee.statusColor ===
                                    "orange"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                employee.statusColor === "green"
                                  ? "bg-green-600"
                                  : employee.statusColor ===
                                      "orange"
                                    ? "bg-orange-600"
                                    : "bg-gray-600"
                              }`}
                            />
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {employee.shift}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              onClick={() => alert(`Edit employee ${employee.id}`)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => alert(`More actions for ${employee.id}`)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Management Section */}
      <AnimatePresence mode="wait">
        {activeTab === "financial" && (
          <motion.div
            key="financial"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Monthly Revenue",
                  value: 45230,
                  icon: TrendingUp,
                  color: "green",
                  trend: "+18%",
                  prefix: "$",
                },
                {
                  label: "Operating Costs",
                  value: 32450,
                  icon: TrendingDown,
                  color: "red",
                  trend: "71.7%",
                  prefix: "$",
                },
                {
                  label: "Net Profit",
                  value: 12780,
                  icon: DollarSign,
                  color: "blue",
                  trend: "28.3%",
                  prefix: "$",
                },
                {
                  label: "Transactions",
                  value: 1248,
                  icon: BarChart3,
                  color: "purple",
                  trend: "This month",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                const colorMap: Record<string, string> = {
                  green: "bg-green-100 text-green-600",
                  red: "bg-red-100 text-red-600",
                  blue: "bg-blue-100 text-blue-600",
                  purple: "bg-purple-100 text-purple-600",
                };

                return (
                  <motion.div
                    key={stat.label}
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
                        className={`p-3 rounded-lg ${colorMap[stat.color]}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      <AnimatedCounter
                        end={stat.value}
                        prefix={stat.prefix || ""}
                      />
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stat.trend}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Transactions Table */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      {
                        id: "TXN-001",
                        description:
                          "Bottle Collection Revenue",
                        category: "Collections",
                        type: "Income",
                        amount: 15230,
                        date: "2026-03-10",
                      },
                      {
                        id: "TXN-002",
                        description: "Staff Salaries",
                        category: "Payroll",
                        type: "Expense",
                        amount: -12000,
                        date: "2026-03-09",
                      },
                      {
                        id: "TXN-003",
                        description: "Equipment Maintenance",
                        category: "Maintenance",
                        type: "Expense",
                        amount: -3450,
                        date: "2026-03-08",
                      },
                      {
                        id: "TXN-004",
                        description: "Recycling Incentives",
                        category: "Revenue",
                        type: "Income",
                        amount: 8750,
                        date: "2026-03-07",
                      },
                      {
                        id: "TXN-005",
                        description: "Fuel Costs",
                        category: "Operations",
                        type: "Expense",
                        amount: -2180,
                        date: "2026-03-06",
                      },
                    ].map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{
                          backgroundColor: "#F9FAFB",
                        }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              transaction.type === "Income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-base font-semibold ${
                              transaction.amount > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}$
                            {Math.abs(
                              transaction.amount,
                            ).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {transaction.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              onClick={() => alert(`View invoice ${transaction.id}`)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => alert(`More actions for ${transaction.id}`)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
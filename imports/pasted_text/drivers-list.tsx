"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  CircleX,
  Phone,
  Mail,
  Calendar,
  Award,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  MoreVertical,
  Navigation,
  Package,
  DollarSign,
  Activity,
  UserCheck,
  UserX,
} from "lucide-react";
import { AddDriverDialog } from "../../components/AddDriverDialog";
import { EditDriverDialog } from "../../components/EditDriverDialog";
import { useDrivers } from "@/app/contexts/DriversContext";

type DriverStatus =
  | "active"
  | "inactive"
  | "on-leave"
  | "available";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  currentRoute: string;
  completedTrips: number;
  rating: number;
  earnings: number;
  onTimePercentage: number;
  fuelEfficiency: number;
  avatar: string;
  vehicleNumber: string;
  joinDate: string;
  lastActive: string;
}

const driversData: Driver[] = [
  {
    id: "DRV-001",
    name: "Ahmed Hassan",
    phone: "+966 50 123 4567",
    email: "ahmed@recyclehub.com",
    status: "active",
    currentRoute: "Route #12",
    completedTrips: 248,
    rating: 4.8,
    earnings: 12450,
    onTimePercentage: 96,
    fuelEfficiency: 8.5,
    avatar: "AH",
    vehicleNumber: "VEH-101",
    joinDate: "2025-01-15",
    lastActive: "2 mins ago",
  },
  {
    id: "DRV-002",
    name: "Mohammed Ali",
    phone: "+966 55 234 5678",
    email: "mohammed@recyclehub.com",
    status: "active",
    currentRoute: "Route #8",
    completedTrips: 312,
    rating: 4.9,
    earnings: 15680,
    onTimePercentage: 98,
    fuelEfficiency: 9.2,
    avatar: "MA",
    vehicleNumber: "VEH-102",
    joinDate: "2024-11-20",
    lastActive: "5 mins ago",
  },
  {
    id: "DRV-003",
    name: "Khalid Ibrahim",
    phone: "+966 54 345 6789",
    email: "khalid@recyclehub.com",
    status: "available",
    currentRoute: "-",
    completedTrips: 189,
    rating: 4.6,
    earnings: 9850,
    onTimePercentage: 92,
    fuelEfficiency: 7.8,
    avatar: "KI",
    vehicleNumber: "VEH-103",
    joinDate: "2025-02-10",
    lastActive: "10 mins ago",
  },
  {
    id: "DRV-004",
    name: "Fahad Yousef",
    phone: "+966 56 456 7890",
    email: "fahad@recyclehub.com",
    status: "inactive",
    currentRoute: "-",
    completedTrips: 156,
    rating: 4.4,
    earnings: 7920,
    onTimePercentage: 88,
    fuelEfficiency: 7.2,
    avatar: "FY",
    vehicleNumber: "VEH-104",
    joinDate: "2025-03-01",
    lastActive: "2 hours ago",
  },
  {
    id: "DRV-005",
    name: "Omar Abdullah",
    phone: "+966 53 567 8901",
    email: "omar@recyclehub.com",
    status: "on-leave",
    currentRoute: "-",
    completedTrips: 203,
    rating: 4.7,
    earnings: 10540,
    onTimePercentage: 94,
    fuelEfficiency: 8.1,
    avatar: "OA",
    vehicleNumber: "VEH-105",
    joinDate: "2025-01-05",
    lastActive: "3 days ago",
  },
];

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>(driversData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | DriverStatus
  >("all");
  const [selectedDriver, setSelectedDriver] =
    useState<Driver | null>(null);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isEditDriverOpen, setIsEditDriverOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const [driverToView, setDriverToView] = useState<Driver | null>(null);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);

  const {
    drivers: liveDrivers,
    availableDrivers: liveAvailable,
    setDriverStatus,
  } = useDrivers();

  // Function to add new driver
  const handleAddDriver = (newDriverData: any) => {
    const newDriver: Driver = {
      id: `DRV-${String(drivers.length + 1).padStart(3, '0')}`,
      name: newDriverData.name || "New Driver",
      phone: newDriverData.phone || "+20 123 456 7890",
      email: newDriverData.email || "driver@recyclehub.com",
      status: "available",
      currentRoute: newDriverData.route ? `Route ${newDriverData.route}` : "-",
      completedTrips: newDriverData.completedTrips ? parseInt(newDriverData.completedTrips) : 0,
      rating: newDriverData.rating ? parseFloat(newDriverData.rating) : 5.0,
      earnings: newDriverData.earnings ? parseFloat(newDriverData.earnings) : 0,
      onTimePercentage: newDriverData.onTimePercentage ? parseInt(newDriverData.onTimePercentage) : 100,
      fuelEfficiency: newDriverData.fuelEfficiency ? parseFloat(newDriverData.fuelEfficiency) : 8.0,
      avatar: newDriverData.name ? newDriverData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : "ND",
      vehicleNumber: newDriverData.vehicle || "VEH-000",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: "Just now",
    };

    setDrivers([newDriver, ...drivers]);
    setIsAddDriverOpen(false);
  };

  // Function to update driver
  const handleUpdateDriver = (updatedData: any) => {
    setDrivers(drivers.map(driver =>
      driver.id === updatedData.id
        ? {
            ...driver,
            name: updatedData.name || driver.name,
            phone: updatedData.phone || driver.phone,
            email: updatedData.email || driver.email,
            vehicleNumber: updatedData.vehicle || driver.vehicleNumber,
            completedTrips: updatedData.completedTrips ? parseInt(updatedData.completedTrips) : driver.completedTrips,
            rating: updatedData.rating ? parseFloat(updatedData.rating) : driver.rating,
            earnings: updatedData.earnings ? parseFloat(updatedData.earnings) : driver.earnings,
            onTimePercentage: updatedData.onTimePercentage ? parseInt(updatedData.onTimePercentage) : driver.onTimePercentage,
            fuelEfficiency: updatedData.fuelEfficiency ? parseFloat(updatedData.fuelEfficiency) : driver.fuelEfficiency,
            avatar: updatedData.name ? updatedData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : driver.avatar,
          }
        : driver
    ));
    setIsEditDriverOpen(false);
    setDriverToEdit(null);
  };

  // Auto-update simulation - updates active drivers every 10 seconds
  useEffect(() => {
    if (!autoUpdateEnabled) return;

    const interval = setInterval(() => {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver => {
          // Only update active drivers
          if (driver.status !== "active") return driver;

          // Random chance to complete a trip (30% chance)
          const completesTrip = Math.random() < 0.3;

          if (completesTrip) {
            const tripEarning = Math.floor(Math.random() * 50) + 30; // $30-$80 per trip
            const wasOnTime = Math.random() < 0.9; // 90% chance on-time

            return {
              ...driver,
              completedTrips: driver.completedTrips + 1,
              earnings: driver.earnings + tripEarning,
              onTimePercentage: Math.round(
                ((driver.onTimePercentage * driver.completedTrips) + (wasOnTime ? 100 : 0)) /
                (driver.completedTrips + 1)
              ),
              // Slightly adjust rating (very small changes)
              rating: Math.min(5, Math.max(0, driver.rating + (Math.random() - 0.5) * 0.1)),
              lastActive: "Just now",
            };
          }

          return driver;
        })
      );
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [autoUpdateEnabled]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
      },
    },
  };

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "available":
        return "bg-blue-100 text-blue-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "on-leave":
        return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusDot = (status: DriverStatus) => {
    switch (status) {
      case "active":
        return "bg-green-600";
      case "available":
        return "bg-blue-600";
      case "inactive":
        return "bg-gray-600";
      case "on-leave":
        return "bg-orange-600";
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      driver.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeDrivers = drivers.filter(
    (d) => d.status === "active",
  ).length;
  const avgRating = (
    drivers.reduce((sum, d) => sum + d.rating, 0) /
    drivers.length
  ).toFixed(1);
  const totalEarnings = drivers.reduce(
    (sum, d) => sum + d.earnings,
    0,
  );
  const totalTrips = drivers.reduce(
    (sum, d) => sum + d.completedTrips,
    0,
  );

  return (
    <div className="space-y-6">
      {/* ── Live Fleet Status Banner ── */}
      <div className="rounded-2xl border border-white/60 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-400" />
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Live Fleet Status
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              {liveAvailable.length} Available
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {liveDrivers.map((d) => {
            const statusStyles = {
              available: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/40",
              busy: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/40",
              "off-duty": "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700",
            };
            const dotStyles = {
              available: "bg-emerald-500",
              busy: "bg-blue-500 animate-pulse",
              "off-duty": "bg-gray-400",
            };
            const textStyles = {
              available: "text-emerald-700 dark:text-emerald-400",
              busy: "text-blue-700 dark:text-blue-400",
              "off-duty": "text-gray-500 dark:text-gray-400",
            };
            return (
              <div
                key={d.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${statusStyles[d.status]}`}
              >
                <div className={`w-6 h-6 rounded-lg ${d.avatarColor} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <span className="text-[9px] font-black text-white">{d.initials}</span>
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-[11px]">{d.name}</p>
                  <p className="text-[9px] text-gray-400">{d.vehicleType}</p>
                </div>
                <div className="flex items-center gap-1 ml-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${dotStyles[d.status]}`} />
                  <span className={`text-[9px] font-bold capitalize ${textStyles[d.status]}`}>
                    {d.status === "off-duty" ? "Off Duty" : d.status === "busy" ? "On Route" : "Available"}
                  </span>
                </div>
                {/* Toggle status quick-action */}
                {d.status === "off-duty" && (
                  <button
                    onClick={() => setDriverStatus(d.id, "available")}
                    className="ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                    title="Mark as Available"
                  >
                    ↑ On
                  </button>
                )}
                {d.status === "available" && (
                  <button
                    onClick={() => setDriverStatus(d.id, "off-duty")}
                    className="ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Mark as Off Duty"
                  >
                    ↓ Off
                  </button>
                )}
                {d.assignedRequestId && (
                  <span className="ml-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {d.assignedRequestId}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Drivers Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage collection drivers and assignments
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={() => {
              const header = "ID,Name,Email,Phone,Status,Rating,Trips,Earnings\n";
              const body = filteredDrivers
                .map((d: any) =>
                  [d.id, d.name, d.email ?? "", d.phone ?? "", d.status, d.rating, d.trips, d.earnings].join(",")
                )
                .join("\n");
              const blob = new Blob([header + body], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `drivers-${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button
            onClick={() => setAutoUpdateEnabled(!autoUpdateEnabled)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoUpdateEnabled
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
            title="Simulate real-time driver activity updates"
          >
            <Activity className={`w-4 h-4 ${autoUpdateEnabled ? "animate-pulse" : ""}`} />
            Auto-Update {autoUpdateEnabled ? "ON" : "OFF"}
          </motion.button>
          <motion.button
            onClick={() => setIsAddDriverOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            label: "Total Drivers",
            value: drivers.length,
            icon: Users,
            color: "green",
            subtitle: `${activeDrivers} active now`,
          },
          {
            label: "Average Rating",
            value: avgRating,
            icon: Star,
            color: "blue",
            subtitle: "Out of 5.0",
          },
          {
            label: "Total Trips",
            value: totalTrips,
            icon: Package,
            color: "purple",
            subtitle: "All time",
          },
          {
            label: "Total Earnings",
            value: `$${(totalEarnings / 1000).toFixed(1)}k`,
            icon: DollarSign,
            color: "orange",
            subtitle: "This month",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            green: "bg-green-100 text-green-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            orange: "bg-orange-100 text-orange-600",
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
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {stat.subtitle}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as any)
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="available">Available</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </motion.div>

      {/* Drivers Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            variants={itemVariants}
            initial={index === 0 && driver.lastActive === "Just now" ? { scale: 0, opacity: 0 } : undefined}
            animate={index === 0 && driver.lastActive === "Just now" ? { scale: 1, opacity: 1 } : undefined}
            transition={index === 0 && driver.lastActive === "Just now" ? { type: "spring", duration: 0.6 } : undefined}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            {/* Driver Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg relative">
                  {driver.avatar}
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusDot(driver.status)}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {driver.name}
                    </h3>
                    {driver.lastActive === "Just now" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full"
                      >
                        NEW
                      </motion.span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {driver.id}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => {
                  setDriverToEdit(driver);
                  setIsEditDriverOpen(true);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit Driver"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${getStatusColor(driver.status)}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${getStatusDot(driver.status)}`}
                />
                <span className="capitalize">
                  {driver.status.replace("-", " ")}
                </span>
              </span>
            </div>

            {/* Driver Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                {driver.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                {driver.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Truck className="w-4 h-4 text-gray-400" />
                {driver.vehicleNumber}
              </div>
              {driver.currentRoute !== "-" && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {driver.currentRoute}
                </div>
              )}
            </div>

            {/* Driver Stats (Trips & Earnings) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Total Trips
                </p>
                <p className="text-lg font-black text-gray-900">
                  {driver.completedTrips}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">
                  Total Earnings
                </p>
                <p className="text-lg font-black text-gray-900">
                  ${(driver.earnings / 1000).toFixed(1)}k
                </p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-100">
              <div className="text-center group-hover:scale-105 transition-transform">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  On-Time
                </p>
                <p className="text-sm font-black text-emerald-600">
                  {driver.onTimePercentage}%
                </p>
              </div>
              <div className="text-center border-x border-gray-100 group-hover:scale-105 transition-transform">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Rating
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <p className="text-sm font-black text-gray-900">
                    {driver.rating}
                  </p>
                </div>
              </div>
              <div className="text-center group-hover:scale-105 transition-transform">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Fuel Eff.
                </p>
                <p className="text-sm font-black text-blue-600">
                  {driver.fuelEfficiency}{" "}
                  <span className="text-[10px] font-medium opacity-70">
                    km/L
                  </span>
                </p>
              </div>
            </div>

            {/* Last Active */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {driver.lastActive}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {driver.joinDate}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => setDriverToView(driver)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                View Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Leaderboard */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performers
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              This month's best drivers
            </p>
          </div>
          <Award className="w-6 h-6 text-yellow-500" />
        </div>

        <div className="space-y-4">
          {drivers
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5)
            .map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {driver.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {driver.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {driver.completedTrips} trips completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {driver.rating}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${driver.earnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      earnings
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Add Driver Dialog */}
      <AddDriverDialog
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        onSuccess={handleAddDriver}
      />

      {/* Edit Driver Dialog */}
      <EditDriverDialog
        isOpen={isEditDriverOpen}
        onClose={() => {
          setIsEditDriverOpen(false);
          setDriverToEdit(null);
        }}
        onSuccess={handleUpdateDriver}
        driver={driverToEdit}
      />

      {/* View Driver Details Modal */}
      {driverToView && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDriverToView(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                {driverToView.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h2 className="text-xl font-bold">{driverToView.name}</h2>
                <p className="text-sm text-gray-500">{driverToView.id}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <DetailRow label="Status" value={driverToView.status} />
              <DetailRow label="Phone" value={driverToView.phone} />
              <DetailRow label="Email" value={driverToView.email} />
              <DetailRow label="Vehicle" value={driverToView.vehicleNumber} />
              <DetailRow label="Current Route" value={driverToView.currentRoute} />
              <DetailRow label="Rating" value={`${driverToView.rating} ★`} />
              <DetailRow label="Completed Trips" value={String(driverToView.completedTrips)} />
              <DetailRow label="On-Time %" value={`${driverToView.onTimePercentage}%`} />
              <DetailRow label="Earnings" value={`$${driverToView.earnings.toLocaleString()}`} />
              <DetailRow label="Joined" value={driverToView.joinDate} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDriverToView(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDriverToEdit(driverToView);
                  setIsEditDriverOpen(true);
                  setDriverToView(null);
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:brightness-110"
              >
                Edit Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
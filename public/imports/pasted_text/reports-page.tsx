"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Eye,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart,
  Clock,
  CheckCircle,
  CircleX,
  AlertCircle,
  Printer,
  Share2,
  Mail,
  X,
} from "lucide-react";

type ReportStatus = "completed" | "pending" | "failed";
type ReportType =
  | "collection"
  | "financial"
  | "performance"
  | "compliance";

interface Report {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  createdDate: string;
  generatedBy: string;
  fileSize: string;
  format: string;
}

const initialReportsData: Report[] = [
  {
    id: "RPT-001",
    name: "Monthly Collection Summary",
    type: "collection",
    status: "completed",
    createdDate: "2026-03-10",
    generatedBy: "Admin User",
    fileSize: "2.4 MB",
    format: "PDF",
  },
  {
    id: "RPT-002",
    name: "Financial Performance Q1",
    type: "financial",
    status: "completed",
    createdDate: "2026-03-09",
    generatedBy: "Manager User",
    fileSize: "1.8 MB",
    format: "XLSX",
  },
  {
    id: "RPT-003",
    name: "Driver Performance Analysis",
    type: "performance",
    status: "pending",
    createdDate: "2026-03-08",
    generatedBy: "Admin User",
    fileSize: "-",
    format: "PDF",
  },
  {
    id: "RPT-004",
    name: "Environmental Compliance",
    type: "compliance",
    status: "completed",
    createdDate: "2026-03-07",
    generatedBy: "System",
    fileSize: "3.2 MB",
    format: "PDF",
  },
  {
    id: "RPT-005",
    name: "Weekly Operations Summary",
    type: "collection",
    status: "failed",
    createdDate: "2026-03-06",
    generatedBy: "Manager User",
    fileSize: "-",
    format: "CSV",
  },
];

const reportTemplates = [
  {
    name: "Collection Summary",
    type: "collection",
    icon: BarChart3,
    color: "green",
    description: "Overview of collection activities",
  },
  {
    name: "Financial Report",
    type: "financial",
    icon: PieChart,
    color: "blue",
    description: "Revenue and expense analysis",
  },
  {
    name: "Performance Metrics",
    type: "performance",
    icon: TrendingUp,
    color: "purple",
    description: "KPIs and performance tracking",
  },
  {
    name: "Compliance Report",
    type: "compliance",
    icon: FileText,
    color: "orange",
    description: "Regulatory compliance status",
  },
];

export default function Reports() {
  const [reportsData, setReportsData] = useState<Report[]>(initialReportsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | ReportStatus
  >("all");
  const [filterType, setFilterType] = useState<
    "all" | ReportType
  >("all");
  const [showNewReportModal, setShowNewReportModal] =
    useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: "",
    type: "collection" as ReportType,
    format: "PDF",
    startDate: "",
    endDate: "",
    includeCharts: true,
    autoEmail: false,
  });

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

  const handleCreateReport = () => {
    if (!reportForm.name.trim()) {
      alert("Please enter a report name");
      return;
    }

    const newReport: Report = {
      id: `RPT-${String(reportsData.length + 1).padStart(3, "0")}`,
      name: reportForm.name,
      type: reportForm.type,
      status: "pending",
      createdDate: new Date().toISOString().split("T")[0],
      generatedBy: "Admin User",
      fileSize: "-",
      format: reportForm.format,
    };

    setReportsData([newReport, ...reportsData]);
    setShowCreateDialog(false);
    setReportForm({
      name: "",
      type: "collection",
      format: "PDF",
      startDate: "",
      endDate: "",
      includeCharts: true,
      autoEmail: false,
    });

    setTimeout(() => {
      setReportsData((prev) =>
        prev.map((r) =>
          r.id === newReport.id
            ? { ...r, status: "completed", fileSize: "1.2 MB" }
            : r
        )
      );
    }, 3000);
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <CircleX className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
    }
  };

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case "collection":
        return <FileBarChart className="w-5 h-5" />;
      case "financial":
        return <FilePieChart className="w-5 h-5" />;
      case "performance":
        return <FileSpreadsheet className="w-5 h-5" />;
      case "compliance":
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ReportType) => {
    switch (type) {
      case "collection":
        return "text-green-600 bg-green-50";
      case "financial":
        return "text-blue-600 bg-blue-50";
      case "performance":
        return "text-purple-600 bg-purple-50";
      case "compliance":
        return "text-orange-600 bg-orange-50";
    }
  };

  const filteredReports = reportsData.filter((report) => {
    const matchesSearch = report.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    const matchesType =
      filterType === "all" || report.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

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
            Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Generate and view system reports
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          {
            label: "Total Reports",
            value: 248,
            icon: FileText,
            color: "green",
          },
          {
            label: "This Month",
            value: 42,
            icon: Calendar,
            color: "blue",
          },
          {
            label: "Pending",
            value: 5,
            icon: Clock,
            color: "orange",
          },
          {
            label: "Completed",
            value: 235,
            icon: CheckCircle,
            color: "purple",
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
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Create Report Dialog */}
      <AnimatePresence>
        {showCreateDialog &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Create New Report
                    </h2>
                    <p className="text-sm text-gray-600">
                      Configure and generate a custom report
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-6 space-y-6">
                {/* Report Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={reportForm.name}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, name: e.target.value })
                    }
                    placeholder="e.g., Weekly Collection Summary"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Report Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTemplates.map((template) => {
                      const Icon = template.icon;
                      const isSelected = reportForm.type === template.type;
                      return (
                        <button
                          key={template.type}
                          onClick={() =>
                            setReportForm({
                              ...reportForm,
                              type: template.type as ReportType,
                            })
                          }
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {template.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={reportForm.startDate}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, startDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={reportForm.endDate}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, endDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-3">
                    {["PDF", "XLSX", "CSV"].map((format) => (
                      <button
                        key={format}
                        onClick={() =>
                          setReportForm({ ...reportForm, format })
                        }
                        className={`flex-1 px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                          reportForm.format === format
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Additional Options
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportForm.includeCharts}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          includeCharts: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Include Charts & Visualizations
                      </p>
                      <p className="text-sm text-gray-600">
                        Add graphs and charts to the report
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportForm.autoEmail}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          autoEmail: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        Auto-Email Report
                      </p>
                      <p className="text-sm text-gray-600">
                        Send to stakeholders when ready
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Generate Report
                </button>
              </div>
            </motion.div>
            </div>,
            document.body
          )}
      </AnimatePresence>

      {/* Report Templates */}
      <AnimatePresence>
        {showNewReportModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                const colorMap: Record<
                  string,
                  { bg: string; text: string; hover: string }
                > = {
                  green: {
                    bg: "bg-green-50",
                    text: "text-green-600",
                    hover: "hover:bg-green-100",
                  },
                  blue: {
                    bg: "bg-blue-50",
                    text: "text-blue-600",
                    hover: "hover:bg-blue-100",
                  },
                  purple: {
                    bg: "bg-purple-50",
                    text: "text-purple-600",
                    hover: "hover:bg-purple-100",
                  },
                  orange: {
                    bg: "bg-orange-50",
                    text: "text-orange-600",
                    hover: "hover:bg-orange-100",
                  },
                };

                return (
                  <motion.button
                    key={template.name}
                    onClick={() => alert(`Generating report: ${template.name}`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 border-gray-200 ${colorMap[template.color].hover} transition-all text-left`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorMap[template.color].bg} ${colorMap[template.color].text} mb-3`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Search */}
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
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Types</option>
          <option value="collection">Collection</option>
          <option value="financial">Financial</option>
          <option value="performance">Performance</option>
          <option value="compliance">Compliance</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as any)
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </motion.div>

      {/* Reports Table */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Generated By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: "#F9FAFB" }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getTypeColor(report.type)}`}
                      >
                        {getTypeIcon(report.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium capitalize">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${getStatusColor(report.status)}`}
                    >
                      {getStatusIcon(report.status)}
                      <span className="capitalize">
                        {report.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {report.createdDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {report.generatedBy}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {report.fileSize}{" "}
                      {report.status === "completed" &&
                        `(${report.format})`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {report.status === "completed" && (
                        <>
                          <motion.button
                            onClick={() => alert(`Preview: ${report.name}`)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${report.name || report.id}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              const url = `${window.location.origin}/dashboard/reports#${report.id}`;
                              navigator.clipboard?.writeText(url);
                              alert(`Share link copied:\n${url}`);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                        </>
                      )}
                      {report.status === "failed" && (
                        <motion.button
                          onClick={() => alert(`Retrying report: ${report.name}`)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Retry"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => {
                          if (window.confirm(`Delete report "${report.name}"?`)) {
                            setReportsData((prev) =>
                              prev.filter((r) => r.id !== report.id)
                            );
                          }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Schedule Report",
            description: "Set up automated report generation",
            icon: Calendar,
            color: "blue",
          },
          {
            title: "Email Reports",
            description: "Send reports to stakeholders",
            icon: Mail,
            color: "green",
          },
          {
            title: "Export Data",
            description: "Download raw data for analysis",
            icon: Download,
            color: "purple",
          },
        ].map((action, index) => {
          const Icon = action.icon;
          const colorMap: Record<
            string,
            { bg: string; text: string; hover: string }
          > = {
            blue: {
              bg: "bg-blue-50",
              text: "text-blue-600",
              hover: "hover:bg-blue-100",
            },
            green: {
              bg: "bg-green-50",
              text: "text-green-600",
              hover: "hover:bg-green-100",
            },
            purple: {
              bg: "bg-purple-50",
              text: "text-purple-600",
              hover: "hover:bg-purple-100",
            },
          };

          return (
            <motion.button
              key={action.title}
              onClick={() => alert(`${action.title} — coming soon.`)}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl border-2 border-gray-200 ${colorMap[action.color].hover} transition-all text-left`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorMap[action.color].bg} ${colorMap[action.color].text} mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
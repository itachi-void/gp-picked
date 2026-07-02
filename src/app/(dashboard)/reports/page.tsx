"use client";

import { useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import {
  FileText,
  Download,
  Calendar,
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
  Share2,
  Mail,
  X,
  Copy,
  RefreshCw,
  FileSearch,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";
import PremiumDownloadButton from "@/app/components/PremiumDownloadButton";
import { accentMap } from "@/app/utils/accent";
import EmptyState from "@/app/components/EmptyState";
import api from "@/lib/axios";

type ReportStatus = "completed" | "pending" | "failed";
type ReportType = "collection" | "financial" | "performance" | "compliance";

interface Report {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  createdDate: string;
  generatedBy: string;
  fileSize: string;
  format: string;
  apiEndpoint?: string;
}

const initialReportsData: Report[] = [
  { id: "RPT-001", name: "Monthly Collection Summary", type: "collection", status: "completed", createdDate: "2026-03-10", generatedBy: "Admin User", fileSize: "2.4 MB", format: "CSV", apiEndpoint: "/admin/list-users-for-admin" },
  { id: "RPT-002", name: "Financial Performance Q1", type: "financial", status: "completed", createdDate: "2026-03-09", generatedBy: "Manager User", fileSize: "1.8 MB", format: "CSV", apiEndpoint: "/admin/Total-Earing" },
  { id: "RPT-003", name: "Driver Performance Analysis", type: "performance", status: "completed", createdDate: "2026-03-08", generatedBy: "Admin User", fileSize: "1.2 MB", format: "CSV", apiEndpoint: "/admin/recycler-with-total-trip" },
  { id: "RPT-004", name: "Environmental Compliance", type: "compliance", status: "completed", createdDate: "2026-03-07", generatedBy: "System", fileSize: "3.2 MB", format: "CSV", apiEndpoint: "/admin/waste-categories" },
];

const reportTemplates = [
  { name: "Collection Summary", type: "collection" as const, icon: BarChart3, accent: "emerald", description: "Overview of collection activities" },
  { name: "Financial Report", type: "financial" as const, icon: PieChart, accent: "teal", description: "Revenue and expense analysis" },
  { name: "Performance Metrics", type: "performance" as const, icon: TrendingUp, accent: "violet", description: "KPIs and performance tracking" },
  { name: "Compliance Report", type: "compliance" as const, icon: FileText, accent: "amber", description: "Regulatory compliance status" },
];

export default function ReportsPage() {
  const { resolvedTheme } = useTheme();
  const [reportsData, setReportsData] = useState<Report[]>(initialReportsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ReportStatus>("all");
  const [filterType, setFilterType] = useState<"all" | ReportType>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ name: "", cadence: "weekly", time: "08:00" });
  const [emailForm, setEmailForm] = useState({ recipients: "", subject: "Reports Snapshot", reportId: "" });
  
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalCount: initialReportsData.length,
    completedCount: initialReportsData.length,
    pendingCount: 0,
    failedCount: 0
  });

  const [reportForm, setReportForm] = useState({
    name: "",
    type: "collection" as ReportType,
    format: "CSV",
    startDate: "",
    endDate: "",
    includeCharts: true,
    autoEmail: false,
  });

  useEffect(() => {
    // Simulate initial aggregation from DB status
    setStatsData({
      totalCount: reportsData.length,
      completedCount: reportsData.filter(r => r.status === "completed").length,
      pendingCount: reportsData.filter(r => r.status === "pending").length,
      failedCount: reportsData.filter(r => r.status === "failed").length
    });
    setLoading(false);
  }, [reportsData]);

  const nextId = () => `RPT-${String(reportsData.length + Math.floor(Math.random() * 90) + 6).padStart(3, "0")}`;

  const completeAfterDelay = (id: string, fileSize = "1.2 MB") => {
    setTimeout(() => {
      setReportsData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "completed", fileSize } : r))
      );
    }, 2500);
  };

  const handleCreateReport = () => {
    if (!reportForm.name.trim()) {
      toast.error("Please enter a report name");
      return;
    }
    
    // Choose appropriate API endpoint based on report type
    let endpoint = "/admin/list-users-for-admin";
    if (reportForm.type === "financial") endpoint = "/admin/Total-Earing";
    else if (reportForm.type === "performance") endpoint = "/admin/recycler-with-total-trip";
    else if (reportForm.type === "compliance") endpoint = "/admin/waste-categories";

    const newReport: Report = {
      id: nextId(),
      name: reportForm.name,
      type: reportForm.type,
      status: "pending",
      createdDate: new Date().toISOString().split("T")[0],
      generatedBy: "Admin User",
      fileSize: "-",
      format: "CSV",
      apiEndpoint: endpoint,
    };
    setReportsData([newReport, ...reportsData]);
    setShowCreateDialog(false);
    setReportForm({ name: "", type: "collection", format: "CSV", startDate: "", endDate: "", includeCharts: true, autoEmail: false });
    toast.success("Report generation queued on server");
    completeAfterDelay(newReport.id);
  };

  const handleDownload = async (report: Report) => {
    toast.info(`Downloading real live data for ${report.name}...`);
    try {
      const endpoint = report.apiEndpoint || "/admin/list-users-for-admin";
      const response = await api.get(endpoint);
      
      let data = response.data;
      if (!data) {
        toast.error("Endpoint returned empty data");
        return;
      }

      // Convert endpoint output to CSV format
      let formattedRows: any[] = [];
      let columns: { key: string; label: string }[] = [];

      if (Array.isArray(data)) {
        formattedRows = data;
        if (data.length > 0) {
          columns = Object.keys(data[0]).map(k => ({ key: k, label: k.toUpperCase() }));
        }
      } else {
        // Single value or object
        formattedRows = [{ value: data }];
        columns = [{ key: "value", label: "RESULT" }];
      }

      exportToCsv(
        report.name.replace(/\s+/g, "-").toLowerCase(),
        formattedRows,
        columns
      );
      toast.success("Download complete");
    } catch (err) {
      console.error("Failed to fetch live report data:", err);
      toast.error("Failed to generate live CSV file from API");
    }
  };

  const handleDuplicate = (report: Report) => {
    const copy: Report = {
      ...report,
      id: nextId(),
      name: `${report.name} (Copy)`,
      status: "pending",
      createdDate: new Date().toISOString().split("T")[0],
      generatedBy: "Admin User",
      fileSize: "-",
    };
    setReportsData((prev) => [copy, ...prev]);
    toast.success("Report duplicate queued");
    completeAfterDelay(copy.id, report.fileSize);
  };

  const handleRetry = (report: Report) => {
    setReportsData((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: "pending", fileSize: "-" } : r))
    );
    toast.info(`Retrying ${report.name}`);
    completeAfterDelay(report.id);
  };

  const handleShare = async (report: Report) => {
    const link = `${window.location.origin}${window.location.pathname}#/reports/${report.id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.success(`Share link: ${link}`);
    }
  };

  const handleSchedule = () => {
    if (!scheduleForm.name.trim()) {
      toast.error("Please name the schedule");
      return;
    }
    setShowScheduleDialog(false);
    toast.success(`Scheduled "${scheduleForm.name}" · ${scheduleForm.cadence} at ${scheduleForm.time}`);
    setScheduleForm({ name: "", cadence: "weekly", time: "08:00" });
  };

  const handleEmail = () => {
    if (!emailForm.recipients.trim()) {
      toast.error("Add at least one recipient");
      return;
    }
    const count = emailForm.recipients.split(/[,;\s]+/).filter(Boolean).length;
    setShowEmailDialog(false);
    toast.success(`Email queued to ${count} recipient${count === 1 ? "" : "s"}`);
    setEmailForm({ recipients: "", subject: "Reports Snapshot", reportId: "" });
  };

  const getStatusIcon = (s: ReportStatus) => (s === "completed" ? <CheckCircle className="w-4 h-4" /> : s === "pending" ? <Clock className="w-4 h-4" /> : <CircleX className="w-4 h-4" />);
  const getStatusAccent = (s: ReportStatus) =>
    s === "completed" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" :
    s === "pending" ? "bg-sky-500/10 text-sky-700 dark:text-sky-300" :
    "bg-rose-500/10 text-rose-700 dark:text-rose-300";

  const getTypeIcon = (t: ReportType) =>
    t === "collection" ? <FileBarChart className="w-5 h-5" /> :
    t === "financial" ? <FilePieChart className="w-5 h-5" /> :
    t === "performance" ? <FileSpreadsheet className="w-5 h-5" /> :
    <FileText className="w-5 h-5" />;
  const getTypeAccent = (t: ReportType) =>
    t === "collection" ? "emerald" : t === "financial" ? "teal" : t === "performance" ? "violet" : "amber";

  const filteredReports = reportsData.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = [
    { label: "Total Reports", value: statsData.totalCount, icon: FileText, accent: "emerald" },
    { label: "Pending", value: statsData.pendingCount, icon: Clock, accent: "sky" },
    { label: "Completed", value: statsData.completedCount, icon: CheckCircle, accent: "violet" },
    { label: "Failed", value: statsData.failedCount, icon: CircleX, accent: "rose" },
  ];

  const hasFilters = searchTerm !== "" || filterStatus !== "all" || filterType !== "all";

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Generate and view system reports</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Report
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-emerald-600/80 font-medium text-lg">Initializing reports dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const a = accentMap[stat.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600" };
              return (
                <div
                  key={stat.label}
                  className="mc-card-in hover-lift"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <GlassCard className="p-5">
                    <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${a.fg}`} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1 font-semibold" style={{ fontWeight: 600 }}>{stat.value}</p>
                  </GlassCard>
                </div>
              );
            })}
          </div>

          <GlassCard className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="collection">Collection</option>
              <option value="financial">Financial</option>
              <option value="performance">Performance</option>
              <option value="compliance">Compliance</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            {hasFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterType("all");
                }}
                className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </GlassCard>

          <GlassCard className="overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="p-10">
                <EmptyState
                  Icon={FileSearch}
                  title={hasFilters ? "No reports match your filters" : "No reports yet"}
                  description={hasFilters ? "Try clearing filters or adjusting your search." : "Create your first report to see it listed here."}
                  primaryAction={
                    hasFilters
                      ? { label: "Clear filters", onClick: () => { setSearchTerm(""); setFilterStatus("all"); setFilterType("all"); } }
                      : { label: "New Report", onClick: () => setShowCreateDialog(true) }
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                    <tr>
                      {["Report Name", "Type", "Status", "Created", "Generated By", "Size", "Actions"].map((h, i) => (
                        <th key={h} className={`px-6 py-4 text-xs text-slate-500 dark:text-slate-400 uppercase ${i === 6 ? "text-right" : "text-left"}`} style={{ fontWeight: 600 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {filteredReports.map((report, index) => {
                      const typeAccent = accentMap[getTypeAccent(report.type)] || { bg: "bg-emerald-500/10", fg: "text-emerald-600" };
                      return (
                        <tr
                          key={report.id}
                          className="mc-slide-from-left"
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${typeAccent.bg} ${typeAccent.fg} flex items-center justify-center`}>
                                {getTypeIcon(report.type)}
                              </div>
                              <div>
                                <p className="text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>{report.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{report.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-full capitalize">
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center gap-1 ${getStatusAccent(report.status)}`}>
                              {getStatusIcon(report.status)}
                              <span className="capitalize">{report.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {report.createdDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">{report.generatedBy}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {report.fileSize} {report.status === "completed" && `(${report.format})`}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {report.status === "completed" && (
                                <>
                                  <button
                                    onClick={() => setPreviewReport(report)}
                                    title="View"
                                    className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(report)}
                                    title="Download"
                                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicate(report)}
                                    title="Duplicate"
                                    className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleShare(report)}
                                    title="Share"
                                    className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {report.status === "failed" && (
                                <button
                                  onClick={() => handleRetry(report)}
                                  title="Retry"
                                  className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setReportsData((prev) => prev.filter((r) => r.id !== report.id));
                                  toast.success("Report deleted");
                                }}
                                title="Delete"
                                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Schedule Report", description: "Automated report generation", icon: Calendar, accent: "teal", onClick: () => setShowScheduleDialog(true) },
              { title: "Email Reports", description: "Send to stakeholders", icon: Mail, accent: "emerald", onClick: () => setShowEmailDialog(true) },
              {
                title: "Export Data",
                description: "Download raw data",
                icon: Download,
                accent: "violet",
                premium: true,
                onClick: () => {
                  exportToCsv("reports", filteredReports, [
                    { key: "id", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "type", label: "Type" },
                    { key: "status", label: "Status" },
                    { key: "createdDate", label: "Created" },
                    { key: "generatedBy", label: "Generated By" },
                    { key: "fileSize", label: "Size" }
                  ]);
                  toast.success(`Exported ${filteredReports.length} rows`);
                },
              },
            ].map((action, index) => {
              const Icon = action.icon;
              const a = accentMap[action.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600" };

              if (action.premium) {
                return (
                  <div
                    key={action.title}
                    className="mc-card-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <GlassCard className="p-6 h-full flex flex-col">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${a.bg} ${a.fg} mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-slate-900 dark:text-white mb-1 font-semibold" style={{ fontWeight: 600 }}>{action.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                      <div className="mt-4">
                        <PremiumDownloadButton
                          theme={resolvedTheme === "dark" ? "dark" : "light"}
                          onDownload={action.onClick}
                        />
                      </div>
                    </GlassCard>
                  </div>
                );
              }

              return (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className="mc-card-in hover-lift text-left cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${a.bg} ${a.fg} mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white mb-1 font-semibold" style={{ fontWeight: 600 }}>{action.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                  </GlassCard>
                </button>
              );
            })}
          </div>
        </>
      )}

      <>
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
            <div
              className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl tracking-tight text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>Create New Report</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configure and generate a custom report</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateDialog(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Report Name *</label>
                  <input
                    type="text"
                    value={reportForm.name}
                    onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                    placeholder="e.g., Weekly Collection Summary"
                    className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Report Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTemplates.map((template) => {
                      const Icon = template.icon;
                      const isSelected = reportForm.type === template.type;
                      const a = accentMap[template.accent] || { bg: "bg-emerald-500/10", fg: "text-emerald-600" };
                      return (
                        <button
                          key={template.type}
                          onClick={() => setReportForm({ ...reportForm, type: template.type })}
                          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.fg} flex items-center justify-center`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-slate-900 dark:text-white text-sm font-semibold" style={{ fontWeight: 600 }}>{template.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{template.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Start Date</label>
                    <input
                      type="date"
                      value={reportForm.startDate}
                      onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                      className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>End Date</label>
                    <input
                      type="date"
                      value={reportForm.endDate}
                      onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                      className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Export Format</label>
                  <div className="flex gap-3">
                    {["CSV"].map((format) => (
                      <button
                        key={format}
                        onClick={() => setReportForm({ ...reportForm, format })}
                        className={`flex-1 h-10 rounded-full border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm`}
                        style={{ fontWeight: 600 }}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm text-slate-700 dark:text-slate-300 font-semibold" style={{ fontWeight: 600 }}>Additional Options</label>
                  <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportForm.includeCharts}
                      onChange={(e) => setReportForm({ ...reportForm, includeCharts: e.target.checked })}
                      className="w-5 h-5 accent-emerald-600"
                    />
                    <div>
                      <p className="text-slate-900 dark:text-white text-sm font-semibold" style={{ fontWeight: 600 }}>Include Charts & Visualizations</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add graphs to the report</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={reportForm.autoEmail}
                      onChange={(e) => setReportForm({ ...reportForm, autoEmail: e.target.checked })}
                      className="w-5 h-5 accent-emerald-600"
                    />
                    <div>
                      <p className="text-slate-900 dark:text-white text-sm font-semibold" style={{ fontWeight: 600 }}>Auto-Email Report</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Send to stakeholders when ready</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {previewReport && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewReport(null)}>
            <div
              className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${accentMap[getTypeAccent(previewReport.type)].bg} ${accentMap[getTypeAccent(previewReport.type)].fg} flex items-center justify-center`}>
                    {getTypeIcon(previewReport.type)}
                  </div>
                  <div>
                    <h2 className="text-xl tracking-tight text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>{previewReport.name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{previewReport.id} · {previewReport.format}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewReport(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Type", value: previewReport.type },
                    { label: "Status", value: previewReport.status },
                    { label: "Created", value: previewReport.createdDate },
                    { label: "Generated By", value: previewReport.generatedBy },
                    { label: "Size", value: previewReport.fileSize },
                    { label: "Format", value: previewReport.format },
                  ].map((row) => (
                    <div key={row.label} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold" style={{ fontWeight: 600 }}>{row.label}</p>
                      <p className="text-sm text-slate-900 dark:text-white mt-1 capitalize font-semibold" style={{ fontWeight: 600 }}>{row.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-semibold" style={{ fontWeight: 600 }}>Summary</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    This {previewReport.type} report compiles data through {previewReport.createdDate}. Open the full export for charts, breakdowns, and supporting tables.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  Close
                </button>
                <PremiumDownloadButton
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  onDownload={() => handleDownload(previewReport)}
                />
              </div>
            </div>
          </div>
        )}

        {showScheduleDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowScheduleDialog(false)}>
            <div
              className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl tracking-tight text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>Schedule Report</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Automate recurring deliveries</p>
                  </div>
                </div>
                <button onClick={() => setShowScheduleDialog(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Schedule Name *</label>
                  <input
                    type="text"
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                    placeholder="e.g., Weekly Operations"
                    className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Cadence</label>
                    <select
                      value={scheduleForm.cadence}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, cadence: e.target.value })}
                      className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Delivery Time</label>
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowScheduleDialog(false)}
                  className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  className="px-5 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors text-sm cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {showEmailDialog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowEmailDialog(false)}>
            <div
              className="mc-scale-in bg-white dark:bg-[#0a0e14] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl tracking-tight text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>Email Reports</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Send a snapshot to your team</p>
                  </div>
                </div>
                <button onClick={() => setShowEmailDialog(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Recipients *</label>
                  <input
                    type="text"
                    value={emailForm.recipients}
                    onChange={(e) => setEmailForm({ ...emailForm, recipients: e.target.value })}
                    placeholder="alice@example.com, bob@example.com"
                    className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Separate multiple emails with commas</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Subject</label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold" style={{ fontWeight: 600 }}>Attach Report</label>
                  <select
                    value={emailForm.reportId}
                    onChange={(e) => setEmailForm({ ...emailForm, reportId: e.target.value })}
                    className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
                  >
                    <option value="">All filtered reports ({filteredReports.length})</option>
                    {reportsData.filter((r) => r.status === "completed").map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowEmailDialog(false)}
                  className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmail}
                  className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors text-sm cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

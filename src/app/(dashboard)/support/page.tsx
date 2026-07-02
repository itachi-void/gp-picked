"use client";

import { useState, useEffect } from "react";
import "@/app/components/motion/motion-components.css";
import { Ticket as TicketIcon, Search, Filter, CheckCircle2, Clock, AlertCircle, Star, X, Plus, Download, Loader2 } from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { toast } from "sonner";
import EmptyState from "@/app/components/EmptyState";
import { DataTable, DataTableColumn } from "@/app/components/DataTable";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";
import api from "@/lib/axios";

type TicketStatus = "open" | "in_progress" | "resolved";
type TicketPriority = "low" | "medium" | "high";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: "complaint" | "inquiry" | "rating" | "other";
  citizenName: string;
  driverName?: string;
  rating?: number;
  createdAt: Date;
}

const statusAccent: Record<TicketStatus, { bg: string; fg: string }> = {
  open: { bg: "bg-rose-500/10", fg: "text-rose-700 dark:text-rose-300" },
  in_progress: { bg: "bg-amber-500/10", fg: "text-amber-700 dark:text-amber-300" },
  resolved: { bg: "bg-emerald-500/10", fg: "text-emerald-700 dark:text-emerald-300" },
};

const inputCls = "w-full px-3 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50";

function priorityIcon(p: TicketPriority) {
  if (p === "high") return <AlertCircle className="w-4 h-4 text-rose-500" />;
  if (p === "medium") return <Clock className="w-4 h-4 text-amber-500" />;
  return <CheckCircle2 className="w-4 h-4 text-sky-500" />;
}

function mapBackendToTicket(t: any): Ticket {
  let mappedStatus: TicketStatus = "open";
  const apiStatus = (t.status || "").toLowerCase().replace(" ", "_");
  if (apiStatus === "inprogress" || apiStatus === "in_progress") mappedStatus = "in_progress";
  else if (apiStatus === "resolved" || apiStatus === "closed") mappedStatus = "resolved";

  let mappedPriority: TicketPriority = "low";
  const apiPriority = (t.priority || "").toLowerCase();
  if (apiPriority === "high" || apiPriority === "urgent") mappedPriority = "high";
  else if (apiPriority === "medium" || apiPriority === "normal") mappedPriority = "medium";

  return {
    id: String(t.ticketID || t.id),
    subject: t.subject || "No Subject",
    description: t.description || "No Description",
    status: mappedStatus,
    priority: mappedPriority,
    category: t.category || (t.rating ? "rating" : "complaint"),
    citizenName: t.citizenName || t.citizen?.fullName || "Citizen",
    driverName: t.driverName || t.driver?.fullName || undefined,
    rating: t.rating || undefined,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
  };
}

export default function SupportTicketsPage() {
  const { role, user } = useRoleContext();
  const { addNotification } = useNotifications();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<{ id: number; name: string }[]>([]);
  const [newTicket, setNewTicket] = useState({ 
    subject: "", 
    description: "", 
    priority: "low" as TicketPriority,
    driverId: ""
  });

  const isCitizen = role === "User" || role === "user" || role === "citizen" || role === "Citizen";
  const isDriver = role === "Driver" || role === "driver" || role === "Recycler" || role === "recycler";
  const isAdmin = role === "Admin" || role === "admin" || role === "Manager" || role === "manager";

  // Fetch support tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      let list: any[] = [];
      const userId = user?.id || 1;

      if (isAdmin) {
        const res = await api.get("/admin/list-tickets-for-admin");
        list = Array.isArray(res.data) ? res.data : [];
      } else if (isEmployee) {
        // Employees do not have a dedicated tickets endpoint in Swagger, return empty list
        list = [];
      } else if (isDriver) {
        const res = await api.get(`/Recycler/tickets/${userId}`);
        list = Array.isArray(res.data) ? res.data : [];
      } else {
        // Citizen / User
        const res = await api.get(`/User/GetUserByIdWithDetails/${userId}`);
        list = res.data?.supportTickets || [];
      }

      const mapped = list.map((t: any) => mapBackendToTicket(t));
      setTickets(mapped);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [role, user]);

  // Fetch drivers list for citizen creation modal
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get("/admin/recyclers-details");
        const list = Array.isArray(res.data) ? res.data : [];
        setDrivers(list.map((d: any) => ({ id: d.recyclerID || d.id, name: d.fullName || d.name })));
      } catch (err) {
        console.log("Using fallback demo drivers list");
        setDrivers([
          { id: 1, name: "Ahmed Hassan" },
          { id: 2, name: "Mike Tyson" },
          { id: 3, name: "Omar S." },
          { id: 4, name: "Khaled H." },
        ]);
      }
    };
    if (isCitizen) {
      fetchDrivers();
    }
  }, [isCitizen]);

  const filtered = tickets.filter((t) => {
    const ms = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    return ms && (filterStatus === "all" || t.status === filterStatus);
  });

  const updateStatus = (id: string, status: TicketStatus) => {
    // Note: Swagger doesn't have an API to update status, we manage it locally
    const t = tickets.find((x) => x.id === id);
    setTickets((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Ticket marked ${status.replace("_", " ")}`);
    if (status === "resolved") {
      addNotification({ title: "Ticket resolved", body: t?.subject ?? `Ticket #${id} resolved.`, severity: "success", icon: "CheckCircle2", link: "/support" });
    }
  };

  const handleExport = () => {
    exportToCsv(
      "support-tickets",
      filtered,
      [
        { key: "id", label: "ID" },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "category", label: "Category" },
        { key: "citizenName", label: "Citizen" },
        { key: "driverName", label: "Driver" },
        { key: "rating", label: "Rating" },
        { key: "createdAt", label: "Created", accessor: (t) => t.createdAt.toISOString() },
      ],
    );
    toast.success(`Exported ${filtered.length} rows`);
  };

  const columns: DataTableColumn<Ticket>[] = [
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (t) => (
        <div className="min-w-0">
          <p className="text-slate-900 dark:text-white truncate font-semibold" style={{ fontWeight: 600 }}>{t.subject}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{t.description}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (t) => {
        const sa = statusAccent[t.status];
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs uppercase ${sa.bg} ${sa.fg}`} style={{ fontWeight: 600 }}>
            {t.status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (t) => (
        <span className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200 capitalize">
          {priorityIcon(t.priority)}
          {t.priority}
        </span>
      ),
    },
    {
      key: "citizenName",
      label: "From",
      sortable: true,
      render: (t) => (
        <div className="text-sm">
          <p className="text-slate-900 dark:text-white font-semibold" style={{ fontWeight: 600 }}>{t.citizenName}</p>
          {t.driverName && <p className="text-xs text-slate-500 dark:text-slate-400">Driver: {t.driverName}</p>}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      accessor: (t) => t.rating ?? 0,
      render: (t) =>
        t.rating ? (
          <span className="inline-flex items-center gap-1 text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-current" />
            {t.rating}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      accessor: (t) => t.createdAt.getTime(),
      render: (t) => <span className="text-sm text-slate-500 dark:text-slate-400">{t.createdAt.toLocaleString()}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (t) =>
        isAdmin ? (
          <div className="flex gap-2">
            {t.status !== "resolved" && (
              <button
                onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "resolved"); }}
                className="px-3 h-8 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-full text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                Resolve
              </button>
            )}
            {t.status === "open" && (
              <button
                onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "in_progress"); }}
                className="px-3 h-8 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-full text-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                Progress
              </button>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim()) return;

    const citizenId = user?.id || 1;
    const payload = {
      subject: newTicket.subject,
      description: newTicket.description,
      citizenId,
      driverId: newTicket.driverId ? Number(newTicket.driverId) : null,
    };

    try {
      await api.post("/user/tickets/create", payload);
      toast.success("Ticket created successfully");
      setIsModalOpen(false);
      setNewTicket({ subject: "", description: "", priority: "low" as TicketPriority, driverId: "" });
      
      // Add notification locally
      addNotification({ 
        title: "Support ticket opened", 
        body: payload.subject, 
        severity: "success", 
        icon: "LifeBuoy", 
        link: "/support" 
      });

      fetchTickets(); // Refresh list
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      toast.error("Failed to submit support ticket");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <TicketIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 700 }}>Support Tickets</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              {isCitizen
                ? "Track your inquiries and complaints"
                : isDriver
                  ? "Report vehicle issues or route problems"
                  : "Manage citizen complaints, inquiries, and driver ratings"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors text-sm cursor-pointer font-semibold"
            style={{ fontWeight: 600 }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {isCitizen && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all active:scale-95 text-sm cursor-pointer font-semibold shadow-md shadow-emerald-500/10">
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          )}
        </div>
      </div>

      <GlassCard className="p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by citizen or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${inputCls}`}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-slate-400" />
          {(["all", "open", "in_progress", "resolved"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 h-10 rounded-full text-xs capitalize transition-colors cursor-pointer ${
                filterStatus === s
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10 font-bold"
                  : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-500" />
          <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">Loading support tickets...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          Icon={TicketIcon}
          title="No tickets found"
          description="Try a different status filter or search term. New tickets will appear here."
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(t) => t.id}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-bold" style={{ fontWeight: 700 }}>
                <TicketIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Create New Ticket
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Subject</span>
                <input required value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className={inputCls} placeholder="Summarize your issue..." />
              </label>
              
              <label className="block">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Select Driver (Optional)</span>
                <select value={newTicket.driverId} onChange={(e) => setNewTicket({ ...newTicket, driverId: e.target.value })} className={inputCls}>
                  <option value="">No Driver Related</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Description</span>
                <textarea
                  required rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 resize-none"
                  placeholder="Provide more details here..."
                />
              </label>
              
              <label className="block">
                <span className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Priority</span>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })} className={inputCls}>
                  <option value="low">Low - General Inquiry</option>
                  <option value="medium">Medium - Important Issue</option>
                  <option value="high">High - Urgent Problem</option>
                </select>
              </label>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer font-semibold">
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

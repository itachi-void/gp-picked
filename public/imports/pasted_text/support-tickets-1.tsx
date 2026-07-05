"use client";

import {
  Ticket as TicketIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Star,
} from "lucide-react";
import { useState } from "react";
import {
  useTickets,
  Ticket,
  TicketStatus,
  TicketPriority,
} from "@/app/contexts/TicketsContext";
import { useRole } from "@/app/contexts/RoleContext";

export default function SupportTickets() {
  const { role } = useRole();
  const { tickets, updateTicketStatus, createTicket } =
    useTickets();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    TicketStatus | "all"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    priority: "low" as TicketPriority,
  });

  // Mock current user names based on role (for demo purposes)
  const currentUserName =
    role === "citizen"
      ? "John Doe"
      : role === "driver"
        ? "Ahmed Hassan"
        : "Admin";

  const filteredTickets = tickets.filter((t) => {
    // Role-based visibility
    if (role === "citizen" && t.citizenName !== currentUserName)
      return false;
    if (
      role === "driver" &&
      t.citizenName !== currentUserName &&
      t.driverName !== currentUserName
    )
      return false;

    const matchesSearch =
      t.subject
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      t.citizenName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || t.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket({
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      category: role === "driver" ? "other" : "complaint", // simplify category based on role
      citizenName:
        role === "citizen"
          ? currentUserName
          : role === "driver"
            ? "System"
            : "Admin",
      driverName:
        role === "driver" ? currentUserName : undefined,
    });
    setIsModalOpen(false);
    setNewTicket({
      subject: "",
      description: "",
      priority: "low",
    });
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "low":
        return (
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TicketIcon className="w-8 h-8 text-blue-500" />
            Support Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            {role === "citizen"
              ? "Track your inquiries and complaints"
              : role === "driver"
                ? "Report vehicle issues or route problems"
                : "Manage citizen complaints, inquiries, and driver ratings"}
          </p>
        </div>

        {(role === "citizen" || role === "driver") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            New Ticket
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by citizen or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            {(
              [
                "all",
                "open",
                "in_progress",
                "resolved",
              ] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status.toUpperCase()}
                  </span>
                  {ticket.category === "rating" && (
                    <span className="flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {ticket.rating} / 5
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    {getPriorityIcon(ticket.priority)}
                    <span className="capitalize">
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm ml-auto md:ml-0">
                    {ticket.createdAt.toLocaleString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {ticket.subject}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                  <p>
                    From:{" "}
                    <span className="text-gray-900">
                      {ticket.citizenName}
                    </span>
                  </p>
                  {ticket.driverName && (
                    <p>
                      Driver:{" "}
                      <span className="text-gray-900">
                        {ticket.driverName}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions - Only Admins/Managers can change status */}
              {(role === "admin" || role === "manager") && (
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {ticket.status !== "resolved" && (
                    <button
                      onClick={() =>
                        updateTicketStatus(
                          ticket.id,
                          "resolved",
                        )
                      }
                      className="flex-1 md:flex-none px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-sm font-bold transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {ticket.status === "open" && (
                    <button
                      onClick={() =>
                        updateTicketStatus(
                          ticket.id,
                          "in_progress",
                        )
                      }
                      className="flex-1 md:flex-none px-4 py-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg text-sm font-bold transition-colors"
                    >
                      Mark In Progress
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <TicketIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No tickets found.
            </p>
          </div>
        )}
      </div>

      {/* Ticket Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TicketIcon className="w-6 h-6 text-blue-500" />
              Create New Ticket
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Summarize your issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Provide more details here..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      priority: e.target
                        .value as TicketPriority,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="low">
                    Low - General Inquiry
                  </option>
                  <option value="medium">
                    Medium - Important Issue
                  </option>
                  <option value="high">
                    High - Urgent Problem
                  </option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
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
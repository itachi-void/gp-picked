"use client";

import { useState } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Image as ImageIcon,
  ShieldAlert,
  TrendingUp,
  Clock,
  X,
  Zap,
} from "lucide-react";
import type { AIValidationSubmission, AIValidationStatus } from "../../types/recyclehub";

const mockSubmissions: AIValidationSubmission[] = [
  {
    id: "VAL-001",
    citizenId: "CIT-12345",
    citizenName: "Ahmed Hassan",
    submittedAt: new Date("2026-05-22T10:30:00"),
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400",
    detectedType: "PET",
    detectedQuantity: 5,
    detectedWeightKg: 0.5,
    confidenceScore: 98,
    status: "Pending",
    pointsToAward: 50,
  },
  {
    id: "VAL-002",
    citizenId: "CIT-12346",
    citizenName: "Fatma Mohamed",
    submittedAt: new Date("2026-05-22T09:15:00"),
    imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400",
    detectedType: "HDPE",
    detectedQuantity: 3,
    detectedWeightKg: 0.3,
    confidenceScore: 92,
    status: "Pending",
    pointsToAward: 30,
  },
  {
    id: "VAL-003",
    citizenId: "CIT-12347",
    citizenName: "Omar Ali",
    submittedAt: new Date("2026-05-22T08:00:00"),
    imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400",
    detectedType: "PET",
    detectedQuantity: 8,
    detectedWeightKg: 0.8,
    confidenceScore: 65,
    status: "Flagged",
    fraudFlags: ["Low confidence score", "Possible duplicate image"],
    pointsToAward: 80,
  },
  {
    id: "VAL-004",
    citizenId: "CIT-12348",
    citizenName: "Sara Mahmoud",
    submittedAt: new Date("2026-05-21T16:45:00"),
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
    detectedType: "PP",
    detectedQuantity: 4,
    detectedWeightKg: 0.4,
    confidenceScore: 95,
    status: "Approved",
    reviewedBy: "Admin User",
    reviewedAt: new Date("2026-05-21T17:00:00"),
    pointsToAward: 40,
  },
  {
    id: "VAL-005",
    citizenId: "CIT-12349",
    citizenName: "Karim Youssef",
    submittedAt: new Date("2026-05-21T14:20:00"),
    imageUrl: "https://images.unsplash.com/photo-1572098661174-87690fb6c527?w=400",
    detectedType: "PET",
    detectedQuantity: 2,
    detectedWeightKg: 0.2,
    confidenceScore: 45,
    status: "Rejected",
    reviewedBy: "Manager User",
    reviewedAt: new Date("2026-05-21T15:00:00"),
    rejectionReason: "Image quality too low for accurate detection",
    pointsToAward: 0,
  },
];

export default function AIValidation() {
  const [submissions, setSubmissions] = useState<AIValidationSubmission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AIValidationStatus>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<AIValidationSubmission | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleApprove = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: "Approved" as AIValidationStatus,
              reviewedBy: "Admin User",
              reviewedAt: new Date(),
            }
          : sub
      )
    );
    setShowDetailsDialog(false);
  };

  const handleReject = (submissionId: string, reason: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: "Rejected" as AIValidationStatus,
              reviewedBy: "Admin User",
              reviewedAt: new Date(),
              rejectionReason: reason,
              pointsToAward: 0,
            }
          : sub
      )
    );
    setShowDetailsDialog(false);
  };

  const getStatusColor = (status: AIValidationStatus) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Flagged":
        return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusIcon = (status: AIValidationStatus) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Approved":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "Flagged":
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: submissions.filter((s) => s.status === "Pending").length,
    flagged: submissions.filter((s) => s.status === "Flagged").length,
    approved: submissions.filter((s) => s.status === "Approved").length,
    rejected: submissions.filter((s) => s.status === "Rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Validation Review</h1>
          <p className="text-gray-600 mt-1">
            Review and validate AI-detected recycling submissions
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
          <Zap className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-900">AI-Powered Detection</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Pending Review",
            value: stats.pending,
            icon: Clock,
            color: "yellow",
          },
          {
            label: "Flagged Items",
            value: stats.flagged,
            icon: AlertTriangle,
            color: "orange",
          },
          {
            label: "Approved",
            value: stats.approved,
            icon: CheckCircle,
            color: "green",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            icon: XCircle,
            color: "red",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            yellow: "bg-yellow-100 text-yellow-600",
            orange: "bg-orange-100 text-orange-600",
            green: "bg-green-100 text-green-600",
            red: "bg-red-100 text-red-600",
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Flagged">Flagged</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={submission.imageUrl}
                alt="Submission"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${getStatusColor(
                    submission.status
                  )}`}
                >
                  {getStatusIcon(submission.status)}
                  {submission.status}
                </span>
              </div>
              {submission.fraudFlags && submission.fraudFlags.length > 0 && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium inline-flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Fraud Alert
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{submission.id}</p>
                  <p className="text-sm text-gray-600">{submission.citizenName}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setShowDetailsDialog(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold text-gray-900">
                    {submission.detectedType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold text-gray-900">
                    {submission.detectedQuantity} items
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-semibold text-gray-900">
                    {submission.detectedWeightKg} kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">AI Confidence:</span>
                  <span
                    className={`font-semibold ${getConfidenceColor(
                      submission.confidenceScore
                    )}`}
                  >
                    {submission.confidenceScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-semibold text-emerald-600">
                    {submission.pointsToAward} pts
                  </span>
                </div>
              </div>

              {submission.status === "Pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(submission.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt("Rejection reason:");
                      if (reason) handleReject(submission.id, reason);
                    }}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Details Dialog */}
      {showDetailsDialog && selectedSubmission && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div onClick={() => setShowDetailsDialog(false)} className="absolute inset-0" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Validation Details
                  </h2>
                  <p className="text-sm text-gray-600">{selectedSubmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-6">
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={selectedSubmission.imageUrl}
                  alt="Submission"
                  className="w-full h-96 object-cover"
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Citizen Name</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSubmission.citizenName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted At</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSubmission.submittedAt.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Detected Type</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSubmission.detectedType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSubmission.detectedQuantity} items
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight (kg)</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSubmission.detectedWeightKg} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">AI Confidence</p>
                  <p
                    className={`font-semibold ${getConfidenceColor(
                      selectedSubmission.confidenceScore
                    )}`}
                  >
                    {selectedSubmission.confidenceScore}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Points to Award</p>
                  <p className="font-semibold text-emerald-600">
                    {selectedSubmission.pointsToAward} points
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                      selectedSubmission.status
                    )}`}
                  >
                    {getStatusIcon(selectedSubmission.status)}
                    {selectedSubmission.status}
                  </span>
                </div>
                {selectedSubmission.reviewedBy && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Reviewed By</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSubmission.reviewedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reviewed At</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSubmission.reviewedAt?.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Fraud Flags */}
              {selectedSubmission.fraudFlags && selectedSubmission.fraudFlags.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Fraud Alerts</p>
                      <ul className="space-y-1">
                        {selectedSubmission.fraudFlags.map((flag, idx) => (
                          <li key={idx} className="text-sm text-red-700">
                            • {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedSubmission.rejectionReason && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                  <p className="text-gray-900">{selectedSubmission.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            {selectedSubmission.status === "Pending" && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => setShowDetailsDialog(false)}
                  className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reason = prompt("Rejection reason:");
                    if (reason) handleReject(selectedSubmission.id, reason);
                  }}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedSubmission.id)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Approve & Award Points
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  MapPin,
  Search,
  Map as MapIcon,
  List,
  UserPlus,
  Crown,
  Activity,
  Target,
  Trophy,
  Gift,
  Calendar,
  TrendingUp,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Globe,
  Lock,
  GraduationCap,
  Home,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Package,
  TrendingUp as TrendingUpIcon,
  FileText,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { useRole } from "@/app/contexts/RoleContext";
import AnimatedCounter from "@/app/components/AnimatedCounter";
import EmptyState from "@/app/components/EmptyState";
import LoadingSpinner from "@/app/components/LoadingSpinner";

interface Community {
  id: string;
  name: string;
  owner: string;
  memberCount: number;
  distance: number;
  activityLevel: "high" | "medium" | "low";
  type: "public" | "private" | "school" | "neighborhood";
  totalBottles: number;
  co2Saved: number;
  monthlyTarget?: number;
  targetProgress?: number;
  lat: number;
  lng: number;
  status?: "active" | "inactive" | "pending";
  createdAt?: string;
  region?: string;
}

interface GoalTarget {
  id: string;
  type: "personal" | "community";
  period: "daily" | "weekly" | "monthly" | "event";
  startDate: Date;
  endDate: Date;
  goal: number;
  current: number;
  status: "not-started" | "in-progress" | "achieved" | "exceeded";
  reward?: {
    type: "cash" | "voucher" | "points";
    value: number;
    condition: number;
  };
}

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Green Neighborhood",
    owner: "Ahmed Al-Saud",
    memberCount: 45,
    distance: 1.2,
    activityLevel: "high",
    type: "neighborhood",
    totalBottles: 12500,
    co2Saved: 625,
    monthlyTarget: 15000,
    targetProgress: 83,
    lat: 24.7136,
    lng: 46.6753,
    status: "active",
    createdAt: "2025-11-01",
    region: "Riyadh",
  },
  {
    id: "2",
    name: "King Fahd University",
    owner: "Dr. Sara Al-Rashid",
    memberCount: 230,
    distance: 2.5,
    activityLevel: "high",
    type: "school",
    totalBottles: 45000,
    co2Saved: 2250,
    monthlyTarget: 50000,
    targetProgress: 90,
    lat: 24.7256,
    lng: 46.6653,
    status: "active",
    createdAt: "2025-09-15",
    region: "Riyadh",
  },
  {
    id: "3",
    name: "Al-Malqa Community",
    owner: "Mohammed Al-Qahtani",
    memberCount: 78,
    distance: 3.8,
    activityLevel: "medium",
    type: "private",
    totalBottles: 8900,
    co2Saved: 445,
    monthlyTarget: 12000,
    targetProgress: 74,
    lat: 24.7436,
    lng: 46.6453,
    status: "active",
    createdAt: "2025-10-20",
    region: "Riyadh",
  },
  {
    id: "4",
    name: "Eco Warriors",
    owner: "Fatima Al-Zahrani",
    memberCount: 156,
    distance: 5.2,
    activityLevel: "high",
    type: "public",
    totalBottles: 28000,
    co2Saved: 1400,
    monthlyTarget: 30000,
    targetProgress: 93,
    lat: 24.6936,
    lng: 46.7053,
    status: "active",
    createdAt: "2025-08-01",
    region: "Jeddah",
  },
  {
    id: "5",
    name: "Riyadh Recyclers",
    owner: "Khalid Al-Mutairi",
    memberCount: 12,
    distance: 7.5,
    activityLevel: "low",
    type: "public",
    totalBottles: 3200,
    co2Saved: 160,
    lat: 24.7536,
    lng: 46.6953,
    status: "inactive",
    createdAt: "2026-01-10",
    region: "Dammam",
  },
  {
    id: "6",
    name: "Al-Nakheel School",
    owner: "Principal Omar Hamdan",
    memberCount: 310,
    distance: 4.1,
    activityLevel: "high",
    type: "school",
    totalBottles: 61000,
    co2Saved: 3050,
    monthlyTarget: 65000,
    targetProgress: 94,
    lat: 24.7336,
    lng: 46.6853,
    status: "active",
    createdAt: "2025-07-22",
    region: "Riyadh",
  },
  {
    id: "7",
    name: "Sustainability Hub",
    owner: "Noura Al-Harbi",
    memberCount: 89,
    distance: 6.3,
    activityLevel: "medium",
    type: "public",
    totalBottles: 19500,
    co2Saved: 975,
    monthlyTarget: 22000,
    targetProgress: 88,
    lat: 24.7036,
    lng: 46.7153,
    status: "pending",
    createdAt: "2026-03-05",
    region: "Jeddah",
  },
];

const mockTargets: GoalTarget[] = [
  {
    id: "1",
    type: "personal",
    period: "weekly",
    startDate: new Date("2026-02-10"),
    endDate: new Date("2026-02-16"),
    goal: 50,
    current: 42,
    status: "in-progress",
    reward: { type: "points", value: 100, condition: 100 },
  },
  {
    id: "2",
    type: "community",
    period: "monthly",
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-02-28"),
    goal: 15000,
    current: 12500,
    status: "in-progress",
    reward: { type: "voucher", value: 500, condition: 120 },
  },
];

// ─── Admin / Manager View ─────────────────────────────────────────────────────
function AdminCommunitiesView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = mockCommunities.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.region || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalMembers = mockCommunities.reduce(
    (s, c) => s + c.memberCount,
    0
  );
  const totalBottles = mockCommunities.reduce(
    (s, c) => s + c.totalBottles,
    0
  );
  const activeCount = mockCommunities.filter(
    (c) => c.status === "active"
  ).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "school":
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "neighborhood":
        return <Home className="h-4 w-4 text-amber-500" />;
      case "private":
        return <Lock className="h-4 w-4 text-purple-500" />;
      default:
        return <Globe className="h-4 w-4 text-green-500" />;
    }
  };

  const getActivityBadge = (level: string) => {
    switch (level) {
      case "high":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 border-gray-300">
            Low
          </Badge>
        );
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-gray-500">
            <AlertCircle className="h-3.5 w-3.5" />
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Communities Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all recycling communities across regions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline-brand"
            size="sm"
            onClick={() => navigate('/dashboard/communities-map')}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Map View
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => alert("New Community — feature ready, dialog wiring pending.")}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Community
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Communities",
            value: mockCommunities.length,
            icon: Building2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Active Communities",
            value: activeCount,
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Members",
            value: totalMembers,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Bottles Collected",
            value: totalBottles,
            icon: BarChart3,
            color: "text-teal-600",
            bg: "bg-teal-50",
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">
                  <AnimatedCounter value={stat.value} />
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Navigation - Where to Go */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Quick Navigation</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/dashboard/communities-map')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-emerald-50 rounded-xl border-2 border-emerald-300 hover:border-emerald-400 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Map View</p>
              <p className="text-xs text-emerald-600 font-medium">Interactive</p>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/overview')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Overview</p>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/pickup-requests')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Requests</p>
              <p className="text-xs text-gray-500">Pickups</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/leaderboards')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-amber-50 rounded-xl border border-gray-200 hover:border-amber-300 transition-all group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Leaderboard</p>
              <p className="text-xs text-gray-500">Rankings</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/badges')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Badges</p>
              <p className="text-xs text-gray-500">Achievements</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search communities, owners, or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-300 text-sm bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-300 text-sm bg-white"
          >
            <option value="all">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="school">School</option>
            <option value="neighborhood">Neighborhood</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Community
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Region
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Bottles
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No communities match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((community) => (
                  <tr
                    key={community.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {community.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <Crown className="h-3 w-3 text-amber-400" />
                          {community.owner}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 capitalize">
                        {getTypeIcon(community.type)}
                        <span className="text-gray-700">{community.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {community.region}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {community.memberCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {community.totalBottles.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getActivityBadge(community.activityLevel)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(community.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === community.id
                                ? null
                                : community.id
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === community.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                alert(`View community: ${community.name}`);
                                setOpenMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                alert(`Edit community: ${community.name}`);
                                setOpenMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit2 className="h-4 w-4 text-amber-500" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete community "${community.name}"?`)) {
                                  alert("Community deleted (demo).");
                                }
                                setOpenMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {(() => {
          const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
          const safePage = Math.min(page, totalPages);
          return (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {filtered.length} of {mockCommunities.length} communities
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-white transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-medium">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-white transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          );
        })()}
      </Card>
    </div>
  );
}

// ─── Citizen / User View ──────────────────────────────────────────────────────
function CitizenCommunitiesView() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading] = useState(false);

  const filteredCommunities = mockCommunities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistance = c.distance <= maxDistance;
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    return matchesSearch && matchesDistance && matchesType;
  });

  const getActivityColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "school":
        return "🏫";
      case "neighborhood":
        return "🏘️";
      case "private":
        return "🔒";
      default:
        return "🌍";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Nearby Communities
          </h1>
          <p className="text-gray-600 mt-1">
            Discover and join communities in your area
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline-brand"
            size="sm"
            onClick={() => navigate('/dashboard/communities-map')}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Full Map
          </Button>
          <Button
            variant={viewMode === "list" ? "brand" : "outline-brand"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === "map" ? "brand" : "outline-brand"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Quick Navigation - Where to Go */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Where to Go?</h2>
          <p className="text-sm text-gray-600 ml-auto">Quick access to important sections</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/dashboard/communities-map')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-emerald-50 rounded-xl border-2 border-emerald-300 hover:border-emerald-400 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Map View</p>
              <p className="text-xs text-emerald-600 font-medium">Explore</p>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/citizen-portal')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">My Portal</p>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/leaderboards')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-amber-50 rounded-xl border border-gray-200 hover:border-amber-300 transition-all group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Rankings</p>
              <p className="text-xs text-gray-500">Leaderboard</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/fleet-map')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">Fleet Map</p>
              <p className="text-xs text-gray-500">Track vehicles</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate('/dashboard/levels')}
            className="flex items-center gap-3 p-4 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUpIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900 text-sm">My Level</p>
              <p className="text-xs text-gray-500">Progress</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">
            <Search className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="my-communities">
            <Users className="h-4 w-4 mr-2" />
            My Communities
          </TabsTrigger>
          <TabsTrigger value="targets">
            <Target className="h-4 w-4 mr-2" />
            Goals & Rewards
          </TabsTrigger>
        </TabsList>

        {/* Discover */}
        <TabsContent value="discover" className="space-y-6">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search for a community or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300"
                >
                  <option value={2}>≤ 2 km</option>
                  <option value={5}>≤ 5 km</option>
                  <option value={10}>≤ 10 km</option>
                  <option value={999}>All distances</option>
                </select>
              </div>
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300"
                >
                  <option value="all">All types</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="school">School</option>
                  <option value="neighborhood">Neighborhood</option>
                </select>
              </div>
            </div>
          </Card>

          {isLoading ? (
            <LoadingSpinner />
          ) : filteredCommunities.length === 0 ? (
            <EmptyState
              title="No communities found"
              description="Try increasing the distance or adjusting the filters"
              icon={Users}
            />
          ) : viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommunities.map((community) => (
                <Card
                  key={community.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {getTypeIcon(community.type)}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {community.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span>{community.owner}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{community.distance} KM</span>
                      </div>
                    </div>
                    <Badge className={getActivityColor(community.activityLevel)}>
                      {community.activityLevel === "high"
                        ? "Active"
                        : community.activityLevel === "medium"
                          ? "Moderate"
                          : "Quiet"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Members</p>
                      <p className="text-xl font-bold text-gray-900">
                        {community.memberCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bottles</p>
                      <p className="text-xl font-bold text-gray-900">
                        <AnimatedCounter value={community.totalBottles} />
                      </p>
                    </div>
                  </div>

                  {community.monthlyTarget && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Monthly Progress</span>
                        <span>{community.targetProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${community.targetProgress}%` }}
                          className={`h-full transition-all duration-700 ${
                            (community.targetProgress ?? 0) >= 90
                              ? "bg-green-500"
                              : (community.targetProgress ?? 0) >= 70
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    variant={
                      community.type === "private" ? "outline-brand" : "brand"
                    }
                    onClick={() =>
                      alert(
                        community.type === "private"
                          ? `Join request sent to ${community.name}.`
                          : `You joined ${community.name}!`
                      )
                    }
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {community.type === "private" ? "Join Request" : "Join now"}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-0 h-[600px] overflow-hidden">
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-100">
                {/* Decorative grid background */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right,#0ea5e91a 1px,transparent 1px),linear-gradient(to bottom,#0ea5e91a 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                {/* Pin markers */}
                {filteredCommunities.slice(0, 6).map((c, i) => {
                  const top = 15 + ((i * 53) % 70);
                  const left = 12 + ((i * 71) % 78);
                  return (
                    <button
                      key={c.id}
                      onClick={() => alert(`${c.name}\nDistance: ~${c.distance ?? "N/A"} km\nMembers: ${c.members ?? "—"}`)}
                      className="absolute -translate-x-1/2 -translate-y-full group"
                      style={{ top: `${top}%`, left: `${left}%` }}
                    >
                      <div className="px-2 py-1 bg-white rounded-lg shadow-md border border-gray-200 text-xs font-semibold text-gray-700 mb-1 whitespace-nowrap group-hover:bg-emerald-50">
                        {c.name}
                      </div>
                      <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg mx-auto group-hover:scale-125 transition-transform" />
                    </button>
                  );
                })}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs text-gray-600">
                  <MapIcon className="h-4 w-4 inline mr-1 text-emerald-600" />
                  Showing {Math.min(filteredCommunities.length, 6)} nearby communities
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* My Communities */}
        <TabsContent value="my-communities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCommunities.slice(0, 2).map((community, index) => (
              <Card
                key={community.id}
                className="p-6 border-2 border-green-200 bg-green-50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                    {getTypeIcon(community.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {community.name}
                    </h3>
                    <p className="text-sm text-gray-600">Member for 3 months</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter value={community.totalBottles} />
                    </p>
                    <p className="text-xs text-gray-600">Bottles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      <AnimatedCounter value={community.co2Saved} />
                    </p>
                    <p className="text-xs text-gray-600">kg CO₂</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      #{index + 1}
                    </p>
                    <p className="text-xs text-gray-600">Your Rank</p>
                  </div>
                </div>

                <Button
                  variant="outline-brand"
                  className="w-full"
                  onClick={() => alert(`Opening group file: ${community.name}`)}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Open Group File
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals & Rewards */}
        <TabsContent value="targets" className="space-y-6">
          {mockTargets.map((target, index) => (
            <Card key={target.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        target.type === "personal" ? "default" : "secondary"
                      }
                    >
                      {target.type === "personal" ? "Personal" : "Community"}
                    </Badge>
                    <Badge variant="outline">
                      {target.period === "weekly"
                        ? "Weekly"
                        : target.period === "monthly"
                          ? "Monthly"
                          : target.period === "daily"
                            ? "Daily"
                            : "Event"}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Goal: {target.goal} bottles
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {target.startDate.toLocaleDateString("en-US")} -{" "}
                      {target.endDate.toLocaleDateString("en-US")}
                    </span>
                  </div>
                </div>
                {target.reward && (
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
                      <Gift className="h-5 w-5" />
                      {target.reward.type === "cash"
                        ? `${target.reward.value} SAR`
                        : target.reward.type === "voucher"
                          ? `Voucher ${target.reward.value} SAR`
                          : `${target.reward.value} points`}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      At {target.reward.condition}% completion
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Progress: {target.current} / {target.goal}
                  </span>
                  <span className="font-bold">
                    {Math.round((target.current / target.goal) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${(target.current / target.goal) * 100}%`,
                    }}
                    className={`h-full transition-all duration-700 ${
                      target.status === "achieved"
                        ? "bg-green-500"
                        : target.status === "exceeded"
                          ? "bg-purple-500"
                          : target.current / target.goal >= 0.8
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                    }`}
                  />
                </div>
              </div>

              {target.status === "in-progress" &&
                target.current / target.goal >=
                  (target.reward?.condition || 100) / 100 && (
                  <Button
                    variant="brand"
                    className="w-full"
                    onClick={() => alert(`Reward claimed for goal: ${target.goal} bottles!`)}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Claim Reward
                  </Button>
                )}
            </Card>
          ))}

          <Button
            variant="outline-brand"
            className="w-full"
            onClick={() => alert("Create New Goal — feature ready, dialog wiring pending.")}
          >
            <Target className="h-4 w-4 mr-2" />
            Create New Goal
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Communities() {
  const { role } = useRole();

  if (role === "admin" || role === "manager") {
    return <AdminCommunitiesView />;
  }

  return <CitizenCommunitiesView />;
}

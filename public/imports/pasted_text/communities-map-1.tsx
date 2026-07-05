import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Filter,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronRight,
  Clock,
  Activity,
  Crown,
  Award,
  Bell,
  User,
  Target,
  Sparkles,
  ArrowLeft,
  List,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface Community {
  id: string;
  name: string;
  type: "public" | "private" | "school" | "neighborhood";
  distance: number;
  members: number;
  bottles: number;
  status: "active" | "inactive";
  rating: number;
  lat: number;
  lng: number;
  owner: string;
  activeUntil?: string;
  image?: string;
}

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Green Neighborhood",
    type: "neighborhood",
    distance: 1.2,
    members: 45,
    bottles: 12500,
    status: "active",
    rating: 4.8,
    lat: 24.7136,
    lng: 46.6753,
    owner: "Ahmed Al-Saud",
    activeUntil: "Active till 8pm",
    image: "🏘️",
  },
  {
    id: "2",
    name: "King Fahd University",
    type: "school",
    distance: 2.5,
    members: 230,
    bottles: 45000,
    status: "active",
    rating: 4.9,
    lat: 24.7256,
    lng: 46.6653,
    owner: "Dr. Sara Al-Rashid",
    activeUntil: "Active 24/7",
    image: "🏫",
  },
  {
    id: "3",
    name: "Al-Malqa Community",
    type: "private",
    distance: 3.8,
    members: 78,
    bottles: 8900,
    status: "active",
    rating: 4.5,
    lat: 24.7436,
    lng: 46.6453,
    owner: "Mohammed Al-Qahtani",
    activeUntil: "Active till 10pm",
    image: "🔒",
  },
  {
    id: "4",
    name: "Eco Warriors",
    type: "public",
    distance: 5.2,
    members: 156,
    bottles: 28000,
    status: "active",
    rating: 4.7,
    lat: 24.6936,
    lng: 46.7053,
    owner: "Fatima Al-Zahrani",
    activeUntil: "Active 24/7",
    image: "🌍",
  },
  {
    id: "5",
    name: "Riyadh Recyclers",
    type: "public",
    distance: 7.5,
    members: 12,
    bottles: 3200,
    status: "inactive",
    rating: 3.8,
    lat: 24.7536,
    lng: 46.6953,
    owner: "Khalid Al-Mutairi",
    image: "🌍",
  },
  {
    id: "6",
    name: "Al-Nakheel School",
    type: "school",
    distance: 4.1,
    members: 310,
    bottles: 61000,
    status: "active",
    rating: 5.0,
    lat: 24.7336,
    lng: 46.6853,
    owner: "Principal Omar",
    activeUntil: "Active till 6pm",
    image: "🏫",
  },
];

export default function CommunitiesMap() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    mockCommunities[0]
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [mapZoom, setMapZoom] = useState(12);

  const filteredCommunities = mockCommunities.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "all" || c.type === filterType;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "school":
        return "text-blue-400";
      case "neighborhood":
        return "text-amber-400";
      case "private":
        return "text-purple-400";
      default:
        return "text-emerald-400";
    }
  };

  return (
    <div className="fixed inset-0 flex bg-gray-950">
      {/* Dark Sidebar */}
      <aside className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RecycleHub</h1>
              <p className="text-xs text-gray-400">Community Finder</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 border-b border-gray-800 flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-750 rounded-lg text-sm text-gray-300 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm text-white transition-colors">
            <Navigation className="w-4 h-4" />
            Nearest
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-750 rounded-lg text-sm text-gray-300 transition-colors">
            <Activity className="w-4 h-4" />
            Active Now
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
              >
                <option value="all">All Types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="school">School</option>
                <option value="neighborhood">Neighborhood</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Communities List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredCommunities.map((community) => (
              <button
                key={community.id}
                onClick={() => setSelectedCommunity(community)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedCommunity?.id === community.id
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {community.image}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-medium">{community.rating}</span>
                      </div>
                    </div>

                    {/* Distance & Type */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">
                        {community.distance} km away
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className={`text-xs capitalize ${getTypeColor(community.type)}`}>
                        {community.type}
                      </span>
                    </div>

                    {/* Status */}
                    {community.status === "active" ? (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs">{community.activeUntil}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                        <span className="text-xs">Inactive</span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {community.members}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />
                        {(community.bottles / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Map Section */}
      <main className="flex-1 relative overflow-hidden">
        {/* Map Background with Dark Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />

          {/* Community Markers */}
          {filteredCommunities.map((community, i) => {
            const top = 20 + ((i * 37) % 60);
            const left = 15 + ((i * 53) % 70);
            const isSelected = selectedCommunity?.id === community.id;

            return (
              <button
                key={community.id}
                onClick={() => setSelectedCommunity(community)}
                className={`absolute -translate-x-1/2 -translate-y-full group z-10`}
                style={{ top: `${top}%`, left: `${left}%` }}
              >
                {/* Label */}
                <div
                  className={`px-3 py-1.5 rounded-lg shadow-lg border text-xs font-semibold mb-2 whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-400 text-white scale-110"
                      : "bg-gray-900/90 border-gray-700 text-gray-200 group-hover:bg-emerald-500/20 group-hover:border-emerald-500"
                  }`}
                >
                  {community.name}
                </div>
                {/* Pin */}
                <div
                  className={`w-6 h-6 rounded-full border-3 shadow-xl mx-auto transition-all ${
                    isSelected
                      ? "bg-emerald-500 border-white scale-125 animate-pulse"
                      : "bg-emerald-600 border-gray-200 group-hover:scale-110"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                </div>
              </button>
            );
          })}

          {/* Route Path (Green Line) */}
          {selectedCommunity && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <path
                d={`M 10% 90% Q 30% 70%, 50% 50% T ${(filteredCommunities.findIndex((c) => c.id === selectedCommunity.id) * 15) % 70 + 15}% ${(filteredCommunities.findIndex((c) => c.id === selectedCommunity.id) * 37) % 60 + 20}%`}
                stroke="url(#emeraldGradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
              <defs>
                <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Floating Controls - Top Left */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <button
            onClick={() => navigate("/dashboard/communities")}
            className="flex items-center gap-2 px-4 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to List</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/communities")}
            className="w-10 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Controls - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={() => navigate("/dashboard/overview")}
            className="w-10 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
          >
            <User className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Controls - Bottom Right */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-2 z-20">
          <button
            onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
            className="w-10 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMapZoom((z) => Math.max(z - 1, 8))}
            className="w-10 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 rounded-xl flex items-center justify-center text-white transition-all shadow-lg shadow-emerald-500/50">
            <Navigation className="w-5 h-5" />
          </button>
        </div>

        {/* Community Details Card - Floating */}
        {selectedCommunity && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-30 px-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-gray-800">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                    {selectedCommunity.image}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {selectedCommunity.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {selectedCommunity.distance} km away
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">
                          {selectedCommunity.rating}
                        </span>
                      </div>
                      <span className="text-gray-600">•</span>
                      {selectedCommunity.status === "active" ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-sm">{selectedCommunity.activeUntil}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Inactive</span>
                      )}
                    </div>
                  </div>

                  {/* Close */}
                  <button
                    onClick={() => setSelectedCommunity(null)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-800">
                <div className="text-center">
                  <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">
                    {selectedCommunity.members}
                  </p>
                  <p className="text-xs text-gray-400">Members</p>
                </div>
                <div className="text-center">
                  <Target className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">
                    {(selectedCommunity.bottles / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-gray-400">Bottles</p>
                </div>
                <div className="text-center">
                  <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white capitalize">
                    {selectedCommunity.type}
                  </p>
                  <p className="text-xs text-gray-400">Type</p>
                </div>
              </div>

              {/* Owner */}
              <div className="px-5 py-3 bg-gray-800/50">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Owned by</span>
                  <span className="font-semibold text-white">
                    {selectedCommunity.owner}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 flex gap-3">
                <button
                  onClick={() =>
                    alert(`Joining ${selectedCommunity.name} community...`)
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/50"
                >
                  Join Community
                </button>
                <button
                  onClick={() => navigate(`/dashboard/communities`)}
                  className="px-6 bg-gray-800 hover:bg-gray-750 text-gray-200 font-semibold py-3 rounded-xl transition-all flex items-center gap-2"
                >
                  More Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

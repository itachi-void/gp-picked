"use client";
import { useState, useEffect, useMemo } from "react";
import "@/app/components/motion/motion-components.css";
import {
  Search,
  MapPin,
  Users,
  Star,
  Filter,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronRight,
  Activity,
  Crown,
  Award,
  Target,
  Sparkles,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/app/components/GlassCard";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

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

const typeAccent: Record<string, string> = {
  school: "text-sky-600 dark:text-sky-400",
  neighborhood: "text-amber-600 dark:text-amber-400",
  private: "text-violet-600 dark:text-violet-400",
  public: "text-emerald-600 dark:text-emerald-400",
};

export default function CommunitiesMapPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    nearest: false,
  });

  const [map, setMap] = useState({
    zoom: 12,
    fullscreen: false,
  });

  const [detailsCommunity, setDetailsCommunity] = useState<Community | null>(
    null,
  );

  const { data: pickupRequests = [] } = useQuery<any[]>({
    queryKey: ["pickup-requests-zones"],
    queryFn: async () => {
      const res = await api.get("/recycler/pickup-requests/search?status=pending");
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const zoneCommunities: Community[] = useMemo(() => {
    const zoneMap = new Map<string, { members: Set<string>; count: number }>();
    (pickupRequests as any[]).forEach((req) => {
      const zone = req.zone || "Unknown";
      if (!zoneMap.has(zone)) zoneMap.set(zone, { members: new Set(), count: 0 });
      const entry = zoneMap.get(zone)!;
      if (req.citizenName) entry.members.add(req.citizenName);
      entry.count++;
    });
    return Array.from(zoneMap.entries()).map(([zone, data], idx) => ({
      id: `zone-${idx}`,
      name: zone,
      type: "neighborhood" as const,
      distance: 0,
      members: data.members.size,
      bottles: data.count,
      status: "active" as const,
      rating: 0,
      lat: 0,
      lng: 0,
      owner: Array.from(data.members)[0] || "Community Leader",
      activeUntil: "Based on recent activity",
      image: undefined,
    }));
  }, [pickupRequests]);

  useEffect(() => {
    if (zoneCommunities.length > 0 && !selectedCommunity) {
      setSelectedCommunity(zoneCommunities[0]);
    }
  }, [zoneCommunities]);

  const filteredCommunities = zoneCommunities
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filters.type === "all" || c.type === filters.type) &&
        (filters.status === "all" || c.status === filters.status),
    )
    .sort((a, b) => (filters.nearest ? a.distance - b.distance : 0));

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1
            className="text-3xl tracking-tight text-slate-900 dark:text-white"
            style={{ fontWeight: 700 }}
          >
            Communities Map
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Discover and join recycling communities nearby
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Future Community Suggestion</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            These zones are suggested based on current pickup activity. Each zone shows active citizens and request volume.
            Real community management features are coming soon.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <GlassCard className="flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/10 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10"
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
              <button
                onClick={() => {
                  const nearest = !filters.nearest;

                  setFilters((prev) => ({
                    ...prev,
                    nearest,
                  }));

                  toast.success(
                    nearest ? "Sorted by nearest" : "Sorting removed",
                  );
                }}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-sm ${
                  filters.nearest
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10"
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                Nearest
              </button>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    status: prev.status === "active" ? "all" : "active",
                  }))
                }
                className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10"
              >
                <Activity className="w-3.5 h-3.5" />
                Active Now
              </button>
            </div>

            {showFilters && (
              <div className="space-y-2 pt-2">
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full px-4 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Types</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="school">School</option>
                  <option value="neighborhood">Neighborhood</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-4 h-9 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[600px]">
            {filteredCommunities.map((community) => {
              const isSelected = selectedCommunity?.id === community.id;
              return (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunity(community)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/50"
                      : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                      {community.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3
                          className="text-slate-900 dark:text-white truncate"
                          style={{ fontWeight: 600 }}
                        >
                          {community.name}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs">{community.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          {community.distance} km away
                        </span>
                        <span className="text-slate-400">•</span>
                        <span
                          className={`capitalize ${typeAccent[community.type]}`}
                        >
                          {community.type}
                        </span>
                      </div>
                      {community.status === "active" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs">
                            {community.activeUntil}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                          <span className="text-xs">Inactive</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
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
              );
            })}
          </div>
        </GlassCard>
        {/* ---------------------- */}
        {/* ده الجزء الخاص بالخريطة - الجانب الأيمن من الصفحة! */}

        <GlassCard className="relative overflow-hidden min-h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-sky-950/30">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />

            {filteredCommunities.map((community, i) => {
              const top = 20 + ((i * 37) % 60);
              const left = 15 + ((i * 53) % 70);
              const isSelected = selectedCommunity?.id === community.id;
              return (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunity(community)}
                  className="absolute -translate-x-1/2 -translate-y-full group z-10"
                  style={{ top: `${top}%`, left: `${left}%` }}
                >
                  <div
                    className={`px-3 py-1.5 rounded-full border text-xs mb-2 whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-400 text-white scale-110"
                        : "bg-white/90 dark:bg-[#0a0e14]/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {community.name}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full mx-auto transition-all border-2 border-white shadow-lg ${
                      isSelected
                        ? "bg-emerald-500 animate-breathing"
                        : "bg-emerald-600 group-hover:scale-110"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={() =>
                setMap((prev) => ({
                  ...prev,
                  zoom: Math.min(prev.zoom + 1, 18),
                }))
              }
              className="w-10 h-10 bg-white/90 dark:bg-[#0a0e14]/80 backdrop-blur border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setMap((prev) => ({
                  ...prev,
                  zoom: Math.max(prev.zoom - 1, 8),
                }))
              }
              className="w-10 h-10 bg-white/90 dark:bg-[#0a0e14]/80 backdrop-blur border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const fullscreen = !map.fullscreen;

                setMap((prev) => ({
                  ...prev,
                  fullscreen,
                }));

                toast.success(
                  fullscreen ? "Fullscreen mode" : "Exited fullscreen",
                );
              }}
              className={`w-10 h-10 backdrop-blur border rounded-full flex items-center justify-center transition-colors ${
                map.fullscreen
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                  : "bg-white/90 dark:bg-[#0a0e14]/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-white"
              }`}
            >
              {/* هنا */}
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // Center map on user's location (simulated)
                setMap((prev) => ({
                  ...prev,
                  zoom: 14,
                }));
                setSelectedCommunity(
                  filteredCommunities[0],
                );
                toast.success("Centered on your location");
              }}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {selectedCommunity && (
            <div className="absolute bottom-4 left-4 right-20 max-w-md z-30">
              <div className="bg-white/90 dark:bg-[#0a0e14]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {selectedCommunity.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl tracking-tight text-slate-900 dark:text-white mb-1">
                        {selectedCommunity.name}
                      </h2>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {selectedCommunity.distance} km away
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm" style={{ fontWeight: 600 }}>
                            {selectedCommunity.rating}
                          </span>
                        </div>
                        <span className="text-slate-400">•</span>
                        {selectedCommunity.status === "active" ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm">
                              {selectedCommunity.activeUntil}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCommunity(null)}
                      className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-5 border-b border-slate-200 dark:border-white/10">
                  <div className="text-center">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <p
                      className="text-lg tracking-tight text-slate-900 dark:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {selectedCommunity.members}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Members
                    </p>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
                    <p
                      className="text-lg tracking-tight text-slate-900 dark:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {(selectedCommunity.bottles / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bottles
                    </p>
                  </div>
                  <div className="text-center">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <p
                      className="text-lg tracking-tight text-slate-900 dark:text-white capitalize"
                      style={{ fontWeight: 600 }}
                    >
                      {selectedCommunity.type}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Type
                    </p>
                  </div>
                </div>







                <div className="px-5 py-3 bg-slate-50 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Owned by</span>
                    <span
                      className="text-slate-900 dark:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {selectedCommunity.owner}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex gap-3">
                  <button
                    onClick={() => {
                      toast.success(`You joined ${selectedCommunity.name}!`, {
                        description:
                          "Check your profile to see your communities",
                      });
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-10 transition-colors text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Join Community
                  </button>
                  <button
                    onClick={() => setDetailsCommunity(selectedCommunity)}
                    className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full transition-colors text-sm flex items-center gap-2"
                  >
                    Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}



          
        </GlassCard>
      </div>

      {detailsCommunity && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDetailsCommunity(null)}
        >
          <div
            className="bg-white dark:bg-[#0a0e14] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl">
                  {detailsCommunity.image}
                </div>
                <div>
                  <h2
                    className="text-xl tracking-tight text-slate-900 dark:text-white"
                    style={{ fontWeight: 600 }}
                  >
                    {detailsCommunity.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                    {detailsCommunity.type} community
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsCommunity(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Members",
                    value: detailsCommunity.members.toLocaleString(),
                  },
                  {
                    label: "Bottles Collected",
                    value: detailsCommunity.bottles.toLocaleString(),
                  },
                  {
                    label: "Distance",
                    value: `${detailsCommunity.distance} km`,
                  },
                  { label: "Rating", value: `${detailsCommunity.rating} ★` },
                  { label: "Status", value: detailsCommunity.status },
                  { label: "Owner", value: detailsCommunity.owner },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5"
                  >
                    <p
                      className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      style={{ fontWeight: 600 }}
                    >
                      {row.label}
                    </p>
                    <p
                      className="text-sm text-slate-900 dark:text-white mt-1 capitalize"
                      style={{ fontWeight: 600 }}
                    >
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
              {detailsCommunity.activeUntil && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <p
                    className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1"
                    style={{ fontWeight: 600 }}
                  >
                    Availability
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {selectedCommunity?.activeUntil}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setDetailsCommunity(null)}
                className="px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(`You joined ${detailsCommunity.name}!`);
                  setDetailsCommunity(null);
                }}
                className="px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm"
              >
                Join Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

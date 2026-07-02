"use client";

import { useState } from "react";
import "@/app/components/motion/motion-components.css";
import {
  Award,
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Flame,
  Shield,
  Heart,
  Sparkles,
  Search,
  Recycle,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { useRoleContext } from "@/contexts/RoleContext";
import { GlassCard } from "@/app/components/GlassCard";
import { useAuth } from "@/store/authStore";
import { useUserWallet } from "@/hooks/useUserWallet";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

type Rarity = "common" | "rare" | "epic" | "legendary";
type Category = "milestone" | "streak" | "recycling" | "special";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: Category;
  requirement: string;
  rarity: Rarity;
  unlockedBy: string[];
}



const iconMap: Record<string, any> = {
  star: Star,
  trophy: Trophy,
  shield: Shield,
  crown: Crown,
  flame: Flame,
  zap: Zap,
  target: Target,
  heart: Heart,
  sparkles: Sparkles,
};

const rarityGradient: Record<Rarity, string> = {
  common: "from-slate-400 to-slate-500",
  rare: "from-sky-400 to-sky-600",
  epic: "from-violet-400 to-violet-600",
  legendary: "from-amber-400 to-amber-600",
};

const rarityAccent: Record<Rarity, { bg: string; fg: string; ring: string }> = {
  common: { bg: "bg-slate-500/10", fg: "text-slate-600 dark:text-slate-300", ring: "border-slate-300/40" },
  rare: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400", ring: "border-sky-300/40" },
  epic: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400", ring: "border-violet-300/40" },
  legendary: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400", ring: "border-amber-300/40" },
};

const categoryAccent: Record<Category, { bg: string; fg: string }> = {
  recycling: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  streak: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
  milestone: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
  special: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
};

export default function BadgesPage() {
  const { role: _r } = useRoleContext();
  const { user } = useAuth();
  const { data: walletData } = useUserWallet(user?.id);
  const points = walletData?.walletPoints ?? 0;

  const { data: usersRank = [] } = useQuery<any[]>({
    queryKey: ["sorting-users", { sortOrder: "Descending" }],
    queryFn: async () => {
      const res = await api.get("/User/SortingUser", {
        params: { sortOrder: "Descending" },
      });
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const badgesData: Badge[] = [
    { id: "badge-001", name: "Recycling Rookie", description: "Earn your first 10 points", icon: "star", category: "milestone", requirement: "10 points", rarity: "common", unlockedBy: usersRank.filter(u => u.walletPoints >= 10).map(u => u.name) },
    { id: "badge-002", name: "Green Hero", description: "Earn 100 points", icon: "shield", category: "milestone", requirement: "100 points", rarity: "rare", unlockedBy: usersRank.filter(u => u.walletPoints >= 100).map(u => u.name) },
    { id: "badge-003", name: "Eco Guardian", description: "Earn 500 points", icon: "crown", category: "milestone", requirement: "500 points", rarity: "epic", unlockedBy: usersRank.filter(u => u.walletPoints >= 500).map(u => u.name) },
    { id: "badge-004", name: "Planet Savior", description: "Earn 1000 points", icon: "sparkles", category: "milestone", requirement: "1000 points", rarity: "legendary", unlockedBy: usersRank.filter(u => u.walletPoints >= 1000).map(u => u.name) },
    { id: "badge-005", name: "Clean Streak", description: "Earn 50 points", icon: "flame", category: "streak", requirement: "50 points", rarity: "common", unlockedBy: usersRank.filter(u => u.walletPoints >= 50).map(u => u.name) },
    { id: "badge-006", name: "Waste Warrior", description: "Earn 300 points", icon: "zap", category: "recycling", requirement: "300 points", rarity: "rare", unlockedBy: usersRank.filter(u => u.walletPoints >= 300).map(u => u.name) },
    { id: "badge-007", name: "First Steps", description: "Earn 20 points", icon: "target", category: "recycling", requirement: "20 points", rarity: "common", unlockedBy: usersRank.filter(u => u.walletPoints >= 20).map(u => u.name) },
    { id: "badge-008", name: "Recycling Champion", description: "Earn 150 points", icon: "trophy", category: "recycling", requirement: "150 points", rarity: "epic", unlockedBy: usersRank.filter(u => u.walletPoints >= 150).map(u => u.name) },
    { id: "badge-009", name: "Early Adopter", description: "Join in the launch month", icon: "heart", category: "special", requirement: "Launch Month member", rarity: "legendary", unlockedBy: usersRank.map(u => u.name) },
  ];

  const [showCatForm, setShowCatForm] = useState(false);
  const emptyCatForm = { categoryId: "", categoryName: "", pointsPerUnit: "", unitType: "", imagePathFile: null as File | null };
  const [catForm, setCatForm] = useState(emptyCatForm);

  const { data: wasteCategories = [], refetch: refetchCategories } = useQuery<any[]>({
    queryKey: ["waste-categories"],
    queryFn: async () => {
      const res = await api.get("/admin/waste-categories");
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      await api.delete("/admin/delete-waste-category", {
        params: { wasteCategoryId: categoryId },
      });
    },
    onSuccess: () => {
      toast.success("Waste category deleted successfully");
      refetchCategories();
    },
    onError: (err: any) => {
      console.error("Failed to delete waste category:", err);
      toast.error(err.response?.data?.message || "Failed to delete waste category");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (formData: typeof catForm) => {
      const multipartData = new FormData();
      multipartData.append("CategoryId", formData.categoryId);
      multipartData.append("CategoryName", formData.categoryName);
      multipartData.append("PointsPerUnit", formData.pointsPerUnit);
      multipartData.append("UnitType", formData.unitType);
      if (formData.imagePathFile) {
        multipartData.append("ImagePath", formData.imagePathFile);
      }

      await api.post("/admin/create-waste-category", multipartData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Waste category created successfully");
      refetchCategories();
      setShowCatForm(false);
      setCatForm(emptyCatForm);
    },
    onError: (err: any) => {
      console.error("Failed to create waste category:", err);
      toast.error(err.response?.data?.message || "Failed to create waste category");
    },
  });

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("Are you sure you want to delete this waste category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleCreateCategorySubmit = () => {
    if (!catForm.categoryId) {
      toast.error("Category ID is required");
      return;
    }
    if (!catForm.categoryName.trim()) {
      toast.error("Category Name is required");
      return;
    }
    if (!catForm.pointsPerUnit) {
      toast.error("Points Per Unit is required");
      return;
    }
    if (!catForm.unitType.trim()) {
      toast.error("Unit Type is required");
      return;
    }

    createCategoryMutation.mutate(catForm);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");
  const [filterRarity, setFilterRarity] = useState<"all" | Rarity>("all");

  const checkUnlocked = (badgeId: string) => {
    if (badgeId === "badge-001") return points >= 10;
    if (badgeId === "badge-002") return points >= 100;
    if (badgeId === "badge-003") return points >= 500;
    if (badgeId === "badge-004") return points >= 1000;
    if (badgeId === "badge-005") return points >= 50;
    if (badgeId === "badge-006") return points >= 300;
    if (badgeId === "badge-007") return points >= 20;
    if (badgeId === "badge-008") return points >= 150;
    if (badgeId === "badge-009") return true; // joined launch month
    return false;
  };

  const filtered = badgesData.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === "all" || b.category === filterCategory;
    const matchesRar = filterRarity === "all" || b.rarity === filterRarity;
    return matchesSearch && matchesCat && matchesRar;
  });

  const stats = [
    { label: "Total Badges", value: badgesData.length, accent: "emerald", icon: Award },
    { label: "Common", value: badgesData.filter((b) => b.rarity === "common").length, accent: "slate", icon: Star },
    { label: "Rare", value: badgesData.filter((b) => b.rarity === "rare").length, accent: "sky", icon: Shield },
    { label: "Epic", value: badgesData.filter((b) => b.rarity === "epic").length, accent: "violet", icon: Crown },
    { label: "Legendary", value: badgesData.filter((b) => b.rarity === "legendary").length, accent: "amber", icon: Sparkles },
  ];

  const statAccent: Record<string, { bg: string; fg: string }> = {
    emerald: { bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
    slate: { bg: "bg-slate-500/10", fg: "text-slate-600 dark:text-slate-300" },
    sky: { bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" },
    violet: { bg: "bg-violet-500/10", fg: "text-violet-600 dark:text-violet-400" },
    amber: { bg: "bg-amber-500/10", fg: "text-amber-600 dark:text-amber-400" },
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
          <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            Badges & Achievements
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and track user achievements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const a = statAccent[stat.accent];
          return (
            <div key={stat.label} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <GlassCard className="p-5">
                <div className={`w-12 h-12 ${a.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${a.fg}`} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="text-2xl tracking-tight text-slate-900 dark:text-white mt-1" style={{ fontWeight: 600 }}>
                  {stat.value}
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <option value="all">All Categories</option>
            <option value="recycling">Recycling</option>
            <option value="streak">Streak</option>
            <option value="milestone">Milestone</option>
            <option value="special">Special</option>
          </select>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as any)}
            className="px-4 h-10 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((badge, i) => {
          const Icon = iconMap[badge.icon] || Award;
          const isUnlocked = checkUnlocked(badge.id);
          const rA = rarityAccent[badge.rarity];
          const cA = categoryAccent[badge.category];
          return (
            <div key={badge.id} className="mc-card-in hover-lift" style={{ animationDelay: `${i * 0.04}s` }}>
              <GlassCard className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${rarityGradient[badge.rarity]}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${rarityGradient[badge.rarity]} rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={`px-3 py-1 text-xs rounded-full ${cA.bg} ${cA.fg}`} style={{ fontWeight: 600 }}>
                        {badge.category}
                      </span>
                      <span className={`px-3 py-1 text-xs rounded-full capitalize ${rA.bg} ${rA.fg}`} style={{ fontWeight: 600 }}>
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                    {badge.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{badge.description}</p>
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Requirement</p>
                    <p className="text-sm text-slate-900 dark:text-white mt-0.5" style={{ fontWeight: 600 }}>
                      {badge.requirement}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Unlocked By</p>
                      <p className="text-lg text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 600 }}>
                        {badge.unlockedBy.length}
                      </p>
                    </div>
                    {isUnlocked && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-500/10">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span style={{ fontWeight: 600 }}>Achieved</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {wasteCategories.length > 0 && (
        <div className="space-y-4">
          <div className="mc-fade-in-down flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <Recycle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                  Waste Categories Reference
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Point values per waste category from system configuration
                </p>
              </div>
            </div>
            {user?.role === "Admin" && (
              <button
                onClick={() => setShowCatForm(true)}
                className="flex items-center gap-1.5 px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {wasteCategories.map((cat: any, i: number) => (
              <div key={cat.categoryName || i} className="mc-card-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <GlassCard className="p-5 relative group">
                  {user?.role === "Admin" && (
                    <button
                      onClick={() => handleDeleteCategory(cat.categoryId)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
                    {cat.imagePath ? (
                      <img src={cat.imagePath} alt={cat.categoryName} className="w-6 h-6 object-contain" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white font-semibold mb-1">{cat.categoryName}</p>
                  <p className="text-lg text-emerald-600 dark:text-emerald-400 font-bold">
                    {cat.pointsPerUnit} <span className="text-xs text-slate-500 font-normal">pts / unit</span>
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0e14] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-white/10 mc-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 600 }}>Add Waste Category</h2>
              <button onClick={() => setShowCatForm(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Category ID</span>
                <input
                  type="number"
                  value={catForm.categoryId}
                  onChange={(e) => setCatForm({ ...catForm, categoryId: e.target.value })}
                  placeholder="Integer category code (e.g. 5)"
                  className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Category Name</span>
                <input
                  value={catForm.categoryName}
                  onChange={(e) => setCatForm({ ...catForm, categoryName: e.target.value })}
                  placeholder="e.g. Metal"
                  className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Points Per Unit</span>
                <input
                  type="number"
                  value={catForm.pointsPerUnit}
                  onChange={(e) => setCatForm({ ...catForm, pointsPerUnit: e.target.value })}
                  placeholder="Points awarded (e.g. 15)"
                  className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Unit Type</span>
                <input
                  value={catForm.unitType}
                  onChange={(e) => setCatForm({ ...catForm, unitType: e.target.value })}
                  placeholder="e.g. kg or Item"
                  className="w-full h-10 px-4 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Image Icon</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCatForm({ ...catForm, imagePathFile: e.target.files?.[0] || null })}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowCatForm(false)} className="h-10 px-5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">Cancel</button>
              <button onClick={handleCreateCategorySubmit} className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm cursor-pointer font-bold animate-pulse-subtle" style={{ fontWeight: 600 }}>Create Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

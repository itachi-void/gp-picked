import { create } from "zustand";

export interface PointsEntry {
  id: string;
  type: "earn" | "redeem";
  label: string;
  points: number;
  date: string;
  rewardId?: string;
}

interface LedgerStore {
  ledger: PointsEntry[];
  isLoading: boolean;
  error: string | null;
  fetchLedger: () => Promise<void>;
}

export const useLedgerStore = create<LedgerStore>((set) => ({
  ledger: [],
  isLoading: true,
  error: null,

  fetchLedger: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({ isLoading: false, error: "No token found" });
        return;
      }

      const res = await fetch("/api/points-ledger", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Failed to fetch ledger" }));
        set({ isLoading: false, error: err.message });
        return;
      }

      const data = await res.json();

      // Accept both array and { data: [] } wrapper
      const list = Array.isArray(data)
        ? data
        : (data?.data ?? data?.transactions ?? []);

      const mapped: PointsEntry[] = list.map((item: any) => ({
        id: String(item.id || Math.random()),
        type:
          item.type === "redeem" || item.type === "withdraw"
            ? "redeem"
            : "earn",
        label: item.label || item.description || item.title || "",
        points: Math.abs(item.points || item.amount || 0),
        date: item.date || item.createdAt || new Date().toISOString(),
        rewardId: item.rewardId,
      }));

      set({ ledger: mapped, isLoading: false });
    } catch (error: any) {
      console.error("Failed to fetch ledger", error);
      set({
        isLoading: false,
        error: error.message || "Failed to fetch ledger",
      });
    }
  },
}));

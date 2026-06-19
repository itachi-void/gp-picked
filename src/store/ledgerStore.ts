import { create } from "zustand";

// 1. تعريف الواجهات
export interface PointsEntry {
  id: string;
  type: "earn" | "redeem";
  label: string;
  points: number;
  date: string;
  rewardId?: string;
}

// 2. الداتا الوهمية (نقلناها هنا عشان ننضف الصفحة)
const SEED_LEDGER: PointsEntry[] = [
  { id: "p-1", type: "earn", label: "Recycled 420 bottles", points: 8400, date: "2026-05-02" },
  { id: "p-2", type: "earn", label: "Weekly streak bonus", points: 1500, date: "2026-05-20" },
  { id: "p-3", type: "earn", label: "Recycled 260 bottles", points: 5200, date: "2026-06-01" },
  { id: "p-4", type: "redeem", label: "Coffee Voucher", points: 500, date: "2026-06-04", rewardId: "rwd-001" },
  { id: "p-5", type: "redeem", label: "Eco Tote Bag", points: 600, date: "2026-06-08", rewardId: "rwd-007" },
];

interface LedgerStore {
  ledger: PointsEntry[];
  isLoading: boolean;
  fetchLedger: () => Promise<void>;
}

// 3. إنشاء الستور بدالة جلب البيانات
export const useLedgerStore = create<LedgerStore>((set) => ({
  ledger: [],
  isLoading: true, // بنبدأ بحالة التحميل

  fetchLedger: async () => {
    set({ isLoading: true });
    try {
      // ==========================================
      // 🚧 لما الباك إند يجهز، هتشيل الكومنت وتكلم السيرفر من هنا
      // const response = await axios.get('/api/points-ledger');
      // set({ ledger: response.data, isLoading: false });
      // ==========================================

      // 🛠️ الجزء التجريبي (تأخير 0.8 ثانية لمحاكاة التحميل الحقيقي)
      await new Promise((res) => setTimeout(res, 800));
      set({ ledger: SEED_LEDGER, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch ledger", error);
      set({ isLoading: false });
    }
  },
}));

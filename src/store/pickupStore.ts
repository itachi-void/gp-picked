"use client";

import { create } from "zustand";
import axios from "axios";

// ==========================================
// 1. Interfaces (الواجهات)
// ==========================================
export interface PickupItem {
  name: string;
  expectedWeightKg: number;
}

export interface PickupRequest {
  id: string;
  citizen: { name: string };
  zone: { name: string };
  priority: "Critical" | "High" | "Normal" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  items: PickupItem[];
}

// ==========================================
// 2. الداتا الوهمية (Mock Data)
// ==========================================
const INITIAL_REQUESTS: PickupRequest[] = [
  {
    id: "REQ-4091",
    citizen: { name: "Sarah Connor" },
    zone: { name: "Downtown Zone A" },
    priority: "Critical",
    status: "In Progress",
    items: [{ name: "PET Bottles", expectedWeightKg: 45 }],
  },
  {
    id: "REQ-3982",
    citizen: { name: "John Doe" },
    zone: { name: "North Suburbs" },
    priority: "High",
    status: "Pending",
    items: [{ name: "PET Bottles", expectedWeightKg: 28 }],
  },
  {
    id: "REQ-4112",
    citizen: { name: "Emma Watson" },
    zone: { name: "West End" },
    priority: "Normal",
    status: "In Progress",
    items: [{ name: "Glass Bottles", expectedWeightKg: 65 }],
  },
  {
    id: "REQ-4054",
    citizen: { name: "Michael Scott" },
    zone: { name: "Industrial District" },
    priority: "High",
    status: "Completed",
    items: [{ name: "PET Bottles", expectedWeightKg: 120 }],
  },
  {
    id: "REQ-3891",
    citizen: { name: "Bruce Wayne" },
    zone: { name: "Gotham South" },
    priority: "Low",
    status: "Completed",
    items: [{ name: "PET Bottles", expectedWeightKg: 15 }],
  },
  {
    id: "REQ-4201",
    citizen: { name: "Tony Stark" },
    zone: { name: "Downtown Zone B" },
    priority: "Critical",
    status: "Pending",
    items: [{ name: "Mixed Bottles", expectedWeightKg: 95 }],
  },
];

// ==========================================
// 3. شكل الـ Store
// ==========================================
interface PickupStore {
  requests: PickupRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
}

// ==========================================
// 4. الـ Store نفسه
// ==========================================
export const usePickup = create<PickupStore>((set) => ({
  requests: INITIAL_REQUESTS, // Start with INITIAL_REQUESTS directly to match previous context fallback behavior
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    // تفعيل حالة التحميل وتصفير الأخطاء
    set({ isLoading: true, error: null });

    try {
      // ==========================================
      // 🚧 [1] جزء الباك إند الحقيقي (كومنت لحد ما يجهز)
      // ==========================================
      /*
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`${API_BASE_URL}/api/Pickups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ requests: response.data, isLoading: false });
      */

      // ==========================================
      // 🛠️ [2] الجزء التجريبي المؤقت
      // ==========================================
      // تأخير متعمد 1.5 ثانية لاختبار الـ Spinner
      await new Promise((resolve) => setTimeout(resolve, 1500)); 
      
      set({ requests: INITIAL_REQUESTS, isLoading: false });
      // ==========================================

    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "حصلت مشكلة في جلب الطلبات، يرجى المحاولة لاحقاً.", 
        isLoading: false 
      });
    }
  },
}));

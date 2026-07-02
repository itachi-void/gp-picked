"use client";

import { create } from "zustand";
import api from "@/lib/axios";

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

interface PickupStore {
  requests: PickupRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
}

export const usePickup = create<PickupStore>((set) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get("/PickupRequests/GetPendingRequestForms");
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.value || response.data?.data || []);

      const mapped: PickupRequest[] = list.map((r: any) => ({
        id: r.orderNumber || `ORD-${r.requestId}`,
        priority: r.priority || "Normal",
        status: r.status === "Pending" ? "Pending" : "In Progress",
        citizen: { name: r.userName || "not yet from api" },
        zone: { name: r.userAddress?.split(" ")[0] || "not yet from api" },
        items: [{ name: "Mixed", expectedWeightKg: 0 }],
      }));

      set({ requests: mapped, isLoading: false });
    } catch (error: any) {
      set({
        error: "not yet from api",
        isLoading: false,
      });
    }
  },
}));

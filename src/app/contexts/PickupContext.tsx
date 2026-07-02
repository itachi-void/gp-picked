"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface PickupItem {
  plasticType: string;
  expectedWeightKg: number;
  expectedQuantity: number;
}

export interface PickupRequest {
  id: string;
  priority: "Critical" | "High" | "Normal" | "Low";
  status: "Pending" | "In Progress" | "Completed" | "Verified" | "Rejected" | "Failed";
  citizen: { name: string };
  zone: { name: string };
  driver: { name: string } | null;
  items: PickupItem[];
  date?: string;
  verifierName?: string;
  verifierId?: number;
}

const seed: PickupRequest[] = [];

interface PickupContextValue {
  requests: PickupRequest[];
  setRequests: (r: PickupRequest[]) => void;
}

const PickupContext = createContext<PickupContextValue | null>(null);

export function PickupProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<PickupRequest[]>(seed);
  return (
    <PickupContext.Provider value={{ requests, setRequests }}>
      {children}
    </PickupContext.Provider>
  );
}

export function usePickup() {
  const ctx = useContext(PickupContext);
  if (!ctx) throw new Error("usePickup must be used within PickupProvider");
  return ctx;
}

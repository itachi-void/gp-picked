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
  status: "Pending" | "In Progress" | "Completed";
  citizen: { name: string };
  zone: { name: string };
  driver: { name: string } | null;
  items: PickupItem[];
}

const seed: PickupRequest[] = [
  {
    id: "REQ-101",
    priority: "Critical",
    status: "Pending",
    citizen: { name: "John Doe" },
    zone: { name: "Downtown" },
    driver: null,
    items: [
      { plasticType: "PET", expectedWeightKg: 12, expectedQuantity: 45 },
      { plasticType: "HDPE", expectedWeightKg: 8, expectedQuantity: 30 },
    ],
  },
  {
    id: "REQ-102",
    priority: "High",
    status: "In Progress",
    citizen: { name: "Sarah J." },
    zone: { name: "Riverside" },
    driver: { name: "Mike Tyson" },
    items: [{ plasticType: "Glass", expectedWeightKg: 20, expectedQuantity: 60 }],
  },
  {
    id: "REQ-103",
    priority: "Normal",
    status: "Pending",
    citizen: { name: "Ali Ahmed" },
    zone: { name: "Old City" },
    driver: null,
    items: [{ plasticType: "PET", expectedWeightKg: 5, expectedQuantity: 18 }],
  },
  {
    id: "REQ-104",
    priority: "Low",
    status: "Completed",
    citizen: { name: "Maya K." },
    zone: { name: "Harbor" },
    driver: { name: "Omar S." },
    items: [{ plasticType: "HDPE", expectedWeightKg: 14, expectedQuantity: 50 }],
  },
];

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

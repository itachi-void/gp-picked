"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PartnerType = "logistics" | "retail" | "manufacturer" | "ngo";
export type PartnerStatus = "active" | "pending" | "paused";

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  status: PartnerStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shipmentsCount: number;
  totalVolumeKg: number;
  joinDate: string;
  lastShipment: string;
}

interface PartnersContextType {
  partners: Partner[];
  addPartner: (partner: Omit<Partner, "id">) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  removePartner: (id: string) => void;
  assignShipment: (id: string, shipment: { weightKg: number; date: string }) => void;
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

const initialPartners: Partner[] = [
  {
    id: "part-1",
    name: "Green Logix Egypt",
    type: "logistics",
    status: "active",
    contactName: "Sherif Amer",
    contactEmail: "sherif@greenlogix.com",
    contactPhone: "+20 102 345 6789",
    shipmentsCount: 24,
    totalVolumeKg: 12400,
    joinDate: "2025-01-15",
    lastShipment: "2026-06-30",
  },
  {
    id: "part-2",
    name: "HyperOne Retail",
    type: "retail",
    status: "active",
    contactName: "Mariam Soliman",
    contactEmail: "m.soliman@hyperone.com.eg",
    contactPhone: "+20 111 222 3333",
    shipmentsCount: 48,
    totalVolumeKg: 35000,
    joinDate: "2025-03-10",
    lastShipment: "2026-07-01",
  },
  {
    id: "part-3",
    name: "Cemex Egypt Industrial",
    type: "manufacturer",
    status: "active",
    contactName: "Tarek Mansour",
    contactEmail: "tarek.mansour@cemex.com",
    contactPhone: "+20 122 888 9999",
    shipmentsCount: 15,
    totalVolumeKg: 85000,
    joinDate: "2025-05-20",
    lastShipment: "2026-06-25",
  },
  {
    id: "part-4",
    name: "Resala Charity NGO",
    type: "ngo",
    status: "active",
    contactName: "Heba Ali",
    contactEmail: "heba.ali@resala.org",
    contactPhone: "+20 100 555 4444",
    shipmentsCount: 32,
    totalVolumeKg: 9800,
    joinDate: "2025-02-01",
    lastShipment: "2026-06-28",
  },
];

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("b2b_partners");
    if (saved) {
      try {
        setPartners(JSON.parse(saved));
      } catch {
        setPartners(initialPartners);
      }
    } else {
      setPartners(initialPartners);
    }
  }, []);

  const savePartners = (list: Partner[]) => {
    setPartners(list);
    localStorage.setItem("b2b_partners", JSON.stringify(list));
  };

  const addPartner = (newPartner: Omit<Partner, "id">) => {
    const partner: Partner = {
      ...newPartner,
      id: `part-${Date.now()}`,
    };
    savePartners([...partners, partner]);
  };

  const updatePartner = (id: string, updatedFields: Partial<Partner>) => {
    savePartners(
      partners.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const removePartner = (id: string) => {
    savePartners(partners.filter((p) => p.id !== id));
  };

  const assignShipment = (id: string, shipment: { weightKg: number; date: string }) => {
    savePartners(
      partners.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            shipmentsCount: p.shipmentsCount + 1,
            totalVolumeKg: p.totalVolumeKg + shipment.weightKg,
            lastShipment: shipment.date,
          };
        }
        return p;
      })
    );
  };

  return (
    <PartnersContext.Provider
      value={{
        partners,
        addPartner,
        updatePartner,
        removePartner,
        assignShipment,
      }}
    >
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  const context = useContext(PartnersContext);
  if (!context) {
    throw new Error("usePartners must be used within a PartnersProvider");
  }
  return context;
}

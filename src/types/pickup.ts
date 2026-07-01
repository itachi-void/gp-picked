export interface PickupHistory {
  requestId: string;
  orderNumber?: string;
  status: "Pending" | "In Progress" | "Completed";
  createdAt: string;
  timeAgo?: string;
  zone?: {
    name: string;
  };
  citizenName?: string;
  driverName?: string;
  requestImageUrl?: string;
  totalWeight?: number;
  bottlesCount?: number | null;
  categoryName?: string;
  items?: Array<{
    plasticType?: string;
    material?: string;
    categoryName?: string;
    expectedWeightKg?: number;
    weight?: number;
    expectedQuantity?: number;
    quantity?: number;
  }>;
}

export interface LedgerActivity {
  id: string;
  label: string;
  type: "earn" | "spend";
  points: number;
  date: string;
}

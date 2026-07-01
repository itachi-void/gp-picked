export type Step = "scan" | "capture" | "analyze" | "result";
export type Resolution = "verified" | "rejected";

export interface IncomingOrder {
  id: string;
  bagQr: string;
  citizenName: string;
  driverName: string;
  expectedType: string;
  expectedQty: number;
  expectedWeightKg: number;
  pointsToAward: number;
  citizenPhoto: string;
}

export interface AiResult {
  matchScore: number; // 0..100 similarity between citizen & employee photos
  detectedQty: number;
  detectedWeightKg: number;
  flags: string[];
  recommend: "approve" | "review" | "reject";
}

export interface HubRequest {
  requestId: number;
  orderNumber: string;
  userName: string;
  driverName: string;
  timeAgo: string;
  status: string;
  userAddress: string;
}

export interface VerifyResponse {
  status: string;
  finalBottlesCount: number;
  finalPoints: number;
  verificationDate: string;
  message?: string;
  countBefore?: number;
  countAfter?: number;
  similarityScore?: number;
}

export type Step = "capture" | "analyze" | "result";

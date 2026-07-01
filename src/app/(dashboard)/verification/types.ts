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
}

export type Step = "capture" | "analyze" | "result";

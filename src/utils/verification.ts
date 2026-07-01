import type { IncomingOrder, AiResult } from "@/types/verification";

export function computeResult(order: IncomingOrder, hasEmployeePhoto: boolean): AiResult {
  // Mock AI: if employee photo is present, similarity is randomly high, otherwise 0
  const jitter = (Math.random() - 0.5) * 15;
  const matchScore = hasEmployeePhoto ? Math.max(45, Math.min(99, Math.round(82 + jitter))) : 0;
  const detectedQty = Math.max(0, order.expectedQty + Math.round((Math.random() - 0.4) * 2));
  const detectedWeightKg = Math.round((detectedQty * (order.expectedWeightKg / order.expectedQty)) * 100) / 100;

  const flags: string[] = [];
  if (matchScore < 70) flags.push("Low visual similarity to citizen photo");
  if (detectedQty < order.expectedQty) flags.push(`Detected ${detectedQty} bottles, expected ${order.expectedQty}`);
  if (!hasEmployeePhoto) flags.push("Employee photo is missing");

  const recommend = matchScore >= 85 && flags.length === 0 ? "approve" : matchScore >= 65 ? "review" : "reject";
  return { matchScore, detectedQty, detectedWeightKg, flags, recommend };
}

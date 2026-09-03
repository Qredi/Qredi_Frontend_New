import type { ScoreOut, UMKMProfileOut } from "./types";

export interface Application {
  id: string;
  merchantName: string;
  businessType: string;
  creditScore: number;
  riskLevel: "Low" | "Medium" | "High";
  fraudRisk: "Low" | "Moderate" | "Elevated";
  requestedAmount: string;
  submittedAt: string;
  userId: string;
  profile: UMKMProfileOut | null;
  score: ScoreOut | null;
}

export function scoreToRisk(score: number): "Low" | "Medium" | "High" {
  if (score >= 70) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

export function riskToCap(risk: string): "Low" | "Medium" | "High" {
  switch (risk) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Medium";
  }
}

export function fraudFlagToRisk(
  flaggedCount: number,
): "Low" | "Moderate" | "Elevated" {
  if (flaggedCount === 0) return "Low";
  if (flaggedCount <= 2) return "Moderate";
  return "Elevated";
}

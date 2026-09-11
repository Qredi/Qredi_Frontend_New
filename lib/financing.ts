/**
 * Pengajuan pembiayaan dari sisi UMKM.
 */

import { apiFetch } from "./api";
import { applicationsStore, type SubmittedApplication } from "./applications-store";
import type { LenderProduct } from "./lenders";
import type { MatchOut, ScoreOut, UMKMProfileOut, UserOut } from "./types";

export interface SubmitApplicationInput {
  user: UserOut;
  profile: UMKMProfileOut | null;
  score: ScoreOut;
  product: LenderProduct;
  requestedAmount: number;
  tenorMonths: number;
}

export interface SubmitApplicationResult {
  application: SubmittedApplication;
  syncedToBackend: boolean;
}

function localId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function submitApplication(
  input: SubmitApplicationInput,
): Promise<SubmitApplicationResult> {
  const { user, profile, score, product, requestedAmount, tenorMonths } = input;
  const acsScore = Math.round(score.acs_score);

  let backendMatch: MatchOut | null = null;
  try {
    backendMatch = await apiFetch<MatchOut>("/matches/", {
      method: "POST",
      body: JSON.stringify({
        lender_id: product.lenderId,
        match_score: acsScore / 100,
        recommended_limit: requestedAmount,
        reason: `${product.institution} (tenor ${tenorMonths} bulan)`,
      }),
    });
  } catch {
    backendMatch = null;
  }

  const application: SubmittedApplication = {
    id: backendMatch?.id ?? localId(),
    productId: product.id,
    productTitle: product.institution,
    institution: product.institution,
    umkmId: user.id,
    umkmName: user.full_name,
    businessName: profile?.business_name ?? user.full_name,
    businessType: profile?.business_type ?? null,
    city: profile?.city ?? null,
    acsScore,
    riskLevel: score.risk_level,
    matchScore: acsScore,
    requestedAmount,
    tenorMonths,
    interestRate: 0,
    status: backendMatch?.status ?? "pending",
    submittedAt: new Date().toISOString(),
    syncedToBackend: backendMatch !== null,
  };

  applicationsStore.add(application);

  return { application, syncedToBackend: backendMatch !== null };
}

export function defaultRequestedAmount(
  acsScore: number,
  product: LenderProduct,
): number {
  const max = product.maxLimit ?? 25_000_000;
  const ratio = Math.min(Math.max(acsScore, 0), 100) / 100;
  const raw = max * (0.4 + 0.6 * ratio);
  return Math.max(Math.round(raw / 1_000_000) * 1_000_000, 1_000_000);
}
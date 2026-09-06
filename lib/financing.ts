/**
 * Pengajuan pembiayaan dari sisi UMKM.
 */

import { apiFetch } from "./api";
import { applicationsStore, type SubmittedApplication } from "./applications-store";
import { getMatchScore, getOfferedLimit, type LenderProduct } from "./lenders";
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
  /** true kalau backend menerima pengajuan sebagai `match`. */
  syncedToBackend: boolean;
}

function localId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Kirim pengajuan.
 *
 * Backend dicoba lebih dulu lewat `POST /matches/`. Endpoint itu saat ini
 * dibatasi role `lender`/`admin` (lender_id diambil dari user yang login),
 * jadi untuk UMKM akan balik 403 — pengajuan lalu dicatat di store lokal yang
 * dibaca dashboard lender. Begitu backend membuka endpoint ini untuk UMKM,
 * jalur pertama otomatis terpakai tanpa perubahan lain.
 */
export async function submitApplication(
  input: SubmitApplicationInput,
): Promise<SubmitApplicationResult> {
  const { user, profile, score, product, requestedAmount, tenorMonths } = input;

  const acsScore = Math.round(score.acs_score);
  const matchScore = getMatchScore(acsScore, product);

  let backendMatch: MatchOut | null = null;
  try {
    backendMatch = await apiFetch<MatchOut>("/matches/", {
      method: "POST",
      body: JSON.stringify({
        umkm_id: user.id,
        match_score: matchScore / 100,
        recommended_limit: requestedAmount,
        recommended_interest: product.interestRate,
        reason: `${product.title} - ${product.institution} (tenor ${tenorMonths} bulan)`,
      }),
    });
  } catch {
    // 403 = endpoint belum terbuka untuk UMKM. Error lain (jaringan/500) juga
    // tidak boleh menggagalkan pengajuan — cukup jatuh ke store lokal.
    backendMatch = null;
  }

  const application: SubmittedApplication = {
    id: backendMatch?.id ?? localId(),
    productId: product.id,
    productTitle: product.title,
    institution: product.institution,
    umkmId: user.id,
    umkmName: user.full_name,
    businessName: profile?.business_name ?? user.full_name,
    businessType: profile?.business_type ?? null,
    city: profile?.city ?? null,
    acsScore,
    riskLevel: score.risk_level,
    matchScore,
    requestedAmount,
    tenorMonths,
    interestRate: product.interestRate,
    status: backendMatch?.status ?? "pending",
    submittedAt: new Date().toISOString(),
    syncedToBackend: backendMatch !== null,
  };

  applicationsStore.add(application);

  return { application, syncedToBackend: backendMatch !== null };
}

/** Plafon default yang ditawarkan ke UMKM untuk sebuah produk. */
export function defaultRequestedAmount(
  acsScore: number,
  product: LenderProduct,
): number {
  return getOfferedLimit(acsScore, product);
}

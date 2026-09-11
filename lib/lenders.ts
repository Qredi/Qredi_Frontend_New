/**
 * Katalog produk pembiayaan, sekarang diambil dari lender profiles + organizations
 * backend (bukan katalog statis lagi).
 */

import { apiFetch } from "./api";
import type { LenderProfileOut, OrganizationOut } from "./types";

export interface LenderProduct {
  id: string;            // lender_profile.id
  lenderId: string;      // lender_profile.user_id — dipakai sebagai MatchCreate.lender_id
  institution: string;   // organization.name
  orgType: string;       // organization.type
  maxLimit: number | null;
  minScore: number | null; // ditampilkan saja, tidak divalidasi
  position: string | null;
}

export async function loadLenderProducts(): Promise<LenderProduct[]> {
  const [profiles, orgs] = await Promise.all([
    apiFetch<LenderProfileOut[]>("/lender-profiles/"),
    apiFetch<OrganizationOut[]>("/organizations/?active_only=true"),
  ]);

  const orgsById = new Map(orgs.map((o) => [o.id, o]));

  return profiles.map((p) => {
    const org = orgsById.get(p.organization_id);
    return {
      id: p.id,
      lenderId: p.user_id,
      institution: org?.name ?? "Mitra Keuangan",
      orgType: org?.type ?? "fintech",
      maxLimit: p.max_loan_amount,
      minScore: p.min_acs_score,
      position: p.position,
    };
  });
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/** "Rp50 Juta" — format ringkas yang dipakai di kartu rekomendasi. */
export function formatJuta(amount: number): string {
  return `Rp${Math.round(amount / 1_000_000)} Juta`;
}
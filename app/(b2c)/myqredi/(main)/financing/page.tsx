"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import FinancingCard from "@/components/b2c/financing/FinancingCard";
import type { FinancingItem } from "@/components/b2c/financing/FinancingCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  applicationsForUmkm,
  applicationsStore,
} from "@/lib/applications-store";
import {
  formatJuta,
  getMatchScore,
  getOfferedLimit,
  LENDER_PRODUCTS,
} from "@/lib/lenders";
import { getRiskCategory } from "@/lib/scores";
import type { MatchStatus, MatchOut, ScoreOut } from "@/lib/types";

const STATUS_LABELS: Record<MatchStatus, string> = {
  pending: "Diajukan",
  accepted: "Disetujui",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
};

function statusTone(status: MatchStatus): FinancingItem["statusTone"] {
  if (status === "accepted") return "accepted";
  if (status === "rejected" || status === "expired") return "rejected";
  return "pending";
}

/**
 * Match yang dibuat lender lewat backend. `MatchOut` tidak membawa identitas
 * produk, jadi `reason` dipakai untuk mencocokkannya dengan katalog produk;
 * kalau tidak ketemu, data mentah dari backend yang ditampilkan.
 */
function backendMatchToItem(match: MatchOut): FinancingItem {
  const product = LENDER_PRODUCTS.find((p) =>
    match.reason?.startsWith(p.title),
  );

  return {
    id: match.id,
    initial: product?.initial ?? "M",
    title: product?.title ?? "Pembiayaan UMKM",
    institution: product?.institution ?? "Mitra Keuangan",
    plafon: match.recommended_limit
      ? formatJuta(match.recommended_limit)
      : "Hubungi Lender",
    interest:
      match.recommended_interest != null
        ? `${match.recommended_interest}%`
        : "-",
    matchScore:
      match.match_score != null
        ? `${Math.round(match.match_score * 100)}%`
        : "-",
    detailUrl: product
      ? `/myqredi/financing/${product.id}`
      : "/myqredi/financing",
    statusLabel: STATUS_LABELS[match.status],
    statusTone: statusTone(match.status),
  };
}

export default function FinancingPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [backendMatches, setBackendMatches] = useState<MatchOut[]>([]);
  const [loading, setLoading] = useState(true);

  const allApplications = useSyncExternalStore(
    applicationsStore.subscribe,
    applicationsStore.getSnapshot,
    applicationsStore.getServerSnapshot,
  );

  const myApplications = useMemo(
    () => applicationsForUmkm(allApplications, user?.id),
    [allApplications, user?.id],
  );

  useEffect(() => {
    async function load() {
      try {
        const [latestScore, matches] = await Promise.all([
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<MatchOut[]>("/matches/by-umkm/me").catch(
            () => [] as MatchOut[],
          ),
        ]);

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setCategory(getRiskCategory(displayScore));
        setBackendMatches(matches);
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const items = useMemo<FinancingItem[]>(() => {
    // Pengajuan lokal per produk, supaya status bisa ditempel ke kartunya.
    const localByProduct = new Map(
      myApplications.map((a) => [a.productId, a]),
    );

    const backendItems = backendMatches.map(backendMatchToItem);
    const backendProductIds = new Set(
      backendMatches
        .map((m) => LENDER_PRODUCTS.find((p) => m.reason?.startsWith(p.title)))
        .filter((p): p is (typeof LENDER_PRODUCTS)[number] => p != null)
        .map((p) => p.id),
    );

    const catalogItems = LENDER_PRODUCTS.filter(
      (product) => !backendProductIds.has(product.id),
    ).map((product) => {
      const application = localByProduct.get(product.id);
      const offeredLimit = application
        ? application.requestedAmount
        : getOfferedLimit(score, product);

      return {
        id: product.id,
        initial: product.initial,
        title: product.title,
        institution: product.institution,
        plafon: formatJuta(offeredLimit),
        interest: `${product.interestRate}%`,
        matchScore: `${getMatchScore(score, product)}%`,
        detailUrl: `/myqredi/financing/${product.id}`,
        statusLabel: application ? STATUS_LABELS[application.status] : undefined,
        statusTone: application ? statusTone(application.status) : undefined,
      } satisfies FinancingItem;
    });

    // Produk yang sudah diajukan naik ke atas, lalu kecocokan tertinggi.
    return [...backendItems, ...catalogItems].sort((a, b) => {
      const aApplied = a.statusLabel ? 1 : 0;
      const bApplied = b.statusLabel ? 1 : 0;
      if (aApplied !== bApplied) return bApplied - aApplied;
      return parseInt(b.matchScore) - parseInt(a.matchScore);
    });
  }, [backendMatches, myApplications, score]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Ringkasan Skor */}
      <div className="border border-border bg-surface p-5 rounded-2xl shadow-sm space-y-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Rekomendasi Kredit
          </h1>
          <p className="text-sm text-muted font-medium mt-0.5">Untuk Skor</p>
        </div>

        <div className="flex items-baseline gap-3 pt-1">
          <span className="text-4xl font-semibold text-foreground tracking-tight">
            {score}
          </span>
          <span className="text-xl font-semibold text-emerald-600">
            {category}
          </span>
        </div>
      </div>

      {/* Section Rekomendasi */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground px-0.5">
          Rekomendasi Untuk Anda
        </h2>

        <div className="space-y-4">
          {items.length > 0 ? (
            items.map((item) => <FinancingCard key={item.id} item={item} />)
          ) : (
            <div className="text-center py-8 text-muted">
              Belum ada rekomendasi pembiayaan saat ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

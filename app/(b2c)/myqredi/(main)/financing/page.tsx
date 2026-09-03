"use client";

import { useEffect, useState } from "react";
import FinancingCard from "@/components/b2c/financing/FinancingCard";
import type { FinancingItem } from "@/components/b2c/financing/FinancingCard";
import { apiFetch } from "@/lib/api";
import type { ScoreOut, MatchOut } from "@/lib/types";

function getRiskCategory(score: number): string {
  if (score >= 70) return "Baik";
  if (score >= 50) return "Sedang";
  return "Rendah";
}

const LENDER_PRODUCT_MAP: Record<
  string,
  { title: string; institution: string; initial: string }
> = {};

function resolveMatchToFinancingItem(match: MatchOut): FinancingItem {
  const lenderInfo = LENDER_PRODUCT_MAP[match.lender_id] ?? {
    title: "Pembiayaan UMKM",
    institution: "Mitra Keuangan",
    initial: "M",
  };

  return {
    id: match.id,
    initial: lenderInfo.initial,
    title: lenderInfo.title,
    institution: lenderInfo.institution,
    plafon: match.recommended_limit
      ? `Rp${(match.recommended_limit / 1_000_000).toFixed(0)} Juta`
      : "Hubungi Lender",
    interest: match.recommended_interest
      ? `${match.recommended_interest}%`
      : "-",
    matchScore: match.match_score
      ? `${Math.round(match.match_score * 100)}%`
      : "-",
    detailUrl: `/myqredi/financing/${match.id}`,
  };
}

export default function FinancingPage() {
  const [score, setScore] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [items, setItems] = useState<FinancingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [latestScore, matches] = await Promise.all([
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<MatchOut[]>("/matches/by-umkm/me"),
        ]);

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setCategory(getRiskCategory(displayScore));

        setItems(matches.map(resolveMatchToFinancingItem));
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
            items.map((item) => (
              <FinancingCard key={item.id} item={item} />
            ))
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

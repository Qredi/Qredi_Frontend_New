"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkle } from "@phosphor-icons/react";
import ScoreGauge from "@/components/b2c/score/ScoreGauge";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { ScoreOut } from "@/lib/types";

interface ScoreFactor {
  label: string;
  value: string;
  percentage: number;
  valueColor: string;
  barColor: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const DEFAULT_FACTORS: ScoreFactor[] = [
  {
    label: "Konsistensi Transaksi",
    value: "Baik",
    percentage: 75,
    valueColor: "text-emerald-600",
    barColor: "bg-emerald-500",
  },
  {
    label: "Stabilitas Omzet",
    value: "Sedang",
    percentage: 55,
    valueColor: "text-amber-600",
    barColor: "bg-amber-500",
  },
  {
    label: "Riwayat Pembayaran",
    value: "Baik",
    percentage: 80,
    valueColor: "text-emerald-600",
    barColor: "bg-emerald-500",
  },
];

function getRiskCategory(score: number): string {
  if (score >= 70) return "Baik";
  if (score >= 50) return "Sedang";
  return "Rendah";
}

export default function ScoreDetailPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [riskCategory, setRiskCategory] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [factors, setFactors] = useState<ScoreFactor[]>(DEFAULT_FACTORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const latestScore = await apiFetch<ScoreOut>("/scores/me/latest");

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setRiskCategory(getRiskCategory(displayScore));

        const d = new Date(latestScore.created_at ?? Date.now());
        setLastUpdated(
          `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        );
      } catch {
        setFactors(DEFAULT_FACTORS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-40 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <Link
          href="/myqredi/score"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-background"
          aria-label="Kembali"
        >
          <ArrowLeft size={18} weight="bold" />
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-foreground">Detail Skor</h1>
        </div>
      </div>

      {/* Score Summary */}
      <div className="flex flex-col items-center rounded-lg border border-border bg-surface p-6 text-center shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-lg font-semibold text-foreground">
            Skor Qredi Saya
          </p>
        </div>

        <ScoreGauge score={score} statusText={riskCategory} />

        <p className="mt-3 text-xs text-muted">
          Terakhir diperbarui {lastUpdated}
        </p>
      </div>

      {/* Factors */}
      <section>
        <h2 className="text-base font-bold text-foreground">
          Faktor yang Mempengaruhi
        </h2>

        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          {factors.map((factor, index) => (
            <div
              key={factor.label}
              className={`p-4 ${
                index !== factors.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {factor.label}
                </span>

                <span
                  className={`shrink-0 text-sm font-semibold ${factor.valueColor}`}
                >
                  {factor.value}
                </span>
              </div>

              {/* Progress */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-background">
                <div
                  className={`h-full rounded-full ${factor.barColor}`}
                  style={{ width: `${factor.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Insight */}
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-center gap-2 text-base font-semibold text-teal-600">
          <Sparkle size={18} weight="fill" />
          <span>Insight untuk Anda</span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          Konsistensi transaksi dan stabilitas omzet menjadi faktor utama yang
          mendukung skor Anda saat ini.
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, Sparkle } from "@phosphor-icons/react";
import ScoreGauge from "@/components/b2c/score/ScoreGauge";

const SCORE_DATA = {
  businessName: "Kedai Kopi Nusantara",
  score: 82,
  category: "Baik",
  lastUpdated: "26 Agustus 2026",

  factors: [
    {
      label: "Konsistensi Transaksi",
      value: "Sangat Baik",
      percentage: 90,
      valueColor: "text-emerald-600",
      barColor: "bg-emerald-500",
    },
    {
      label: "Aktivitas Transaksi",
      value: "Baik",
      percentage: 78,
      valueColor: "text-emerald-600",
      barColor: "bg-emerald-500",
    },
    {
      label: "Stabilitas Omzet",
      value: "Baik",
      percentage: 75,
      valueColor: "text-emerald-600",
      barColor: "bg-emerald-500",
    },
    {
      label: "Riwayat Transaksi",
      value: "Cukup",
      percentage: 60,
      valueColor: "text-amber-600",
      barColor: "bg-amber-500",
    },
  ],

  insight:
    "Konsistensi transaksi dan stabilitas omzet menjadi faktor utama yang mendukung skor Anda saat ini.",
};

export default function ScoreDetailPage() {
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

        <ScoreGauge score={SCORE_DATA.score} statusText={SCORE_DATA.category} />

        <p className="mt-3 text-xs text-muted">
          Terakhir diperbarui {SCORE_DATA.lastUpdated}
        </p>
      </div>

      {/* Factors */}
      <section>
        <h2 className="text-base font-bold text-foreground">
          Faktor yang Mempengaruhi
        </h2>

        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          {SCORE_DATA.factors.map((factor, index) => (
            <div
              key={factor.label}
              className={`p-4 ${
                index !== SCORE_DATA.factors.length - 1
                  ? "border-b border-border"
                  : ""
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
          {SCORE_DATA.insight}
        </p>
      </div>
    </div>
  );
}

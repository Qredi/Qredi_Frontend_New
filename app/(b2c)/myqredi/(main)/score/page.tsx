"use client";

import Link from "next/link";
import { CaretRight, Sparkle, Clock } from "@phosphor-icons/react";
import ScoreGauge from "@/components/b2c/score/ScoreGauge";
import ScoreTrend from "@/components/b2c/score/ScoreTrend";

const MOCK_SCORE_DATA = {
  userGreetingName: "Budi",
  businessName: "Kedai Kopi Nusantara",
  score: 82,
  category: "Baik",
  lastUpdated: "26 Agustus 2026",
  kpis: [
    {
      id: "consistency",
      label: "Konsistensi Transaksi",
      value: "Sangat Tinggi",
      valueColor: "text-emerald-600",
    },
    {
      id: "activity",
      label: "Aktivitas Transaksi",
      value: "42 tx / hari",
      valueColor: "text-foreground",
    },
    {
      id: "stability",
      label: "Risiko",
      value: "Rendah",
      valueColor: "text-emerald-600",
    },
    {
      id: "period",
      label: "Periode Data QRIS",
      value: "10 Bulan",
      valueColor: "text-foreground",
    },
  ],
  insight:
    "Skor Anda berada dalam kategori Baik. Konsistensi transaksi harian dan pertumbuhan omzet yang stabil menjadi faktor pendorong utama kredit Anda bulan ini.",
  scoreTrends: [
    { month: "Apr", score: 74 },
    { month: "Mei", score: 76 },
    { month: "Jun", score: 78 },
    { month: "Jul", score: 78 },
    { month: "Agu", score: 82 },
  ],
};

export default function ScorePage() {
  const {
    userGreetingName,
    businessName,
    score,
    category,
    lastUpdated,
    kpis,
    insight,
    scoreTrends,
  } = MOCK_SCORE_DATA;

  return (
    <div className="space-y-6">
      {/* Header / Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Halo, {userGreetingName} 👋
          </h1>
          <p className="text-sm text-muted mt-0.5">{businessName}</p>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          ● Terhubung QRIS
        </span>
      </div>

      {/* Qredi Score Card */}
      <div className="border border-border bg-surface p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
        <p className="text-xl font-semibold text-foreground mb-2">
          Skor Qredi Saya
        </p>

        <ScoreGauge score={score} statusText={category} />

        {/* Last Updated */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Clock size={14} />
          <span>Terakhir diperbarui: {lastUpdated}</span>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 rounded-lg border border-border bg-surface shadow-sm divide-x divide-y divide-border overflow-hidden">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="p-3.5 flex flex-col gap-1.5 min-w-0">
            {/* Label */}
            <span className="text-sm font-medium text-muted truncate">
              {kpi.label}
            </span>

            {/* Value */}
            <p
              className={`text-base font-bold tracking-tight truncate ${kpi.valueColor}`}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Button Lihat Detail Skor */}
      <Link
        href="/myqredi/score/detail"
        className="flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-surface font-semibold text-base px-4 py-3.5 rounded-full transition-all active:scale-[0.99]"
      >
        <span>Lihat Detail Skor</span>
        <CaretRight size={18} weight="bold" />
      </Link>

      {/* Insight Section */}
      <div className="border border-teal-200 bg-teal-50 p-4 rounded-lg relative">
        <div className="flex items-center gap-2 text-teal-600 font-semibold text-base mb-2">
          <Sparkle size={18} weight="fill" />
          <span>Insight untuk Anda</span>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed font-normal">
          {insight}
        </p>
      </div>

      {/* Perkembangan Skor (Komponen ScoreTrend) */}
      <ScoreTrend scoreTrends={scoreTrends} diffPoin="+8 Poin" />
    </div>
  );
}

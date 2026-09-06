"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretRight, Sparkle, Clock } from "@phosphor-icons/react";
import ScoreGauge from "@/components/b2c/score/ScoreGauge";
import ScoreTrend from "@/components/b2c/score/ScoreTrend";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  buildInsight,
  buildScoreKpis,
  buildScoreTrend,
  findOldestTransactionTime,
  formatScoreDate,
  getRiskCategory,
  monthsBetween,
  TREND_POINTS,
  type ScoreKpi,
  type ScoreTrend as ScoreTrendData,
} from "@/lib/scores";
import type { QrisTransactionOut, UMKMProfileOut, ScoreOut } from "@/lib/types";

const EMPTY_TREND: ScoreTrendData = {
  points: [],
  diff: 0,
  hasDates: false,
  isFlat: true,
};

/** Cukup untuk menghitung aktivitas & konsistensi terkini tanpa payload besar. */
const ACTIVITY_WINDOW = 1000;

export default function ScorePage() {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [riskCategory, setRiskCategory] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [trend, setTrend] = useState<ScoreTrendData>(EMPTY_TREND);
  const [insight, setInsight] = useState<string>("");
  const [kpis, setKpis] = useState<ScoreKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profile, latestScore, history, transactions] = await Promise.all([
          apiFetch<UMKMProfileOut>("/umkm-profiles/me").catch(() => null),
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<ScoreOut[]>(
            `/scores/me/history?limit=${TREND_POINTS}`,
          ).catch(() => [] as ScoreOut[]),
          apiFetch<QrisTransactionOut[]>(
            `/qris-transactions/me?limit=${ACTIVITY_WINDOW}`,
          ).catch(() => [] as QrisTransactionOut[]),
        ]);

        setBusinessName(profile?.business_name ?? "Usaha Anda");

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setRiskCategory(getRiskCategory(displayScore));
        setLastUpdated(formatScoreDate(latestScore.created_at));

        // Riwayat mungkin belum memuat penilaian terbaru kalau limit-nya pas;
        // pastikan skor terbaru selalu jadi titik terakhir grafik.
        const series = history.some((s) => s.id === latestScore.id)
          ? history
          : [latestScore, ...history];

        const nextTrend = buildScoreTrend(series);
        setTrend(nextTrend);
        setInsight(buildInsight(displayScore, nextTrend));

        // KPI tampil lebih dulu dengan data yang sudah ada; periode QRIS
        // menyusul karena butuh probe transaksi tertua.
        setKpis(buildScoreKpis(transactions, latestScore.risk_level, null));
        setLoading(false);

        const newest = transactions[0]?.transaction_time;
        const oldest = await findOldestTransactionTime(transactions);
        setKpis(
          buildScoreKpis(
            transactions,
            latestScore.risk_level,
            oldest && newest ? monthsBetween(oldest, newest) : null,
          ),
        );
      } catch {
        // fallback to safe defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-48 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-24 bg-slate-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header / Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Halo, {user?.full_name?.split(" ")[0] ?? "Pengguna"} &#x1F44B;
          </h1>
          <p className="text-sm text-muted mt-0.5">{businessName}</p>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          &#x25CF; Terhubung QRIS
        </span>
      </div>

      {/* Qredi Score Card */}
      <div className="border border-border bg-surface p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
        <p className="text-xl font-semibold text-foreground mb-2">
          Skor Qredi Saya
        </p>

        <ScoreGauge score={score ?? 0} statusText={riskCategory} />

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

      {/* Perkembangan Skor */}
      {trend.points.length > 1 && (
        <ScoreTrend
          scoreTrends={trend.points}
          diffPoin={`${trend.diff >= 0 ? "+" : ""}${trend.diff} Poin`}
        />
      )}
    </div>
  );
}

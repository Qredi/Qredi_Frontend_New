"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaretRight, Sparkle, Clock } from "@phosphor-icons/react";
import ScoreGauge from "@/components/b2c/score/ScoreGauge";
import ScoreTrend from "@/components/b2c/score/ScoreTrend";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import type {
  UMKMProfileOut,
  ScoreOut,
} from "@/lib/types";

interface ScoreHistoryItem {
  month: string;
  score: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getRiskCategory(score: number): string {
  if (score >= 70) return "Baik";
  if (score >= 50) return "Sedang";
  return "Rendah";
}

export default function ScorePage() {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [riskCategory, setRiskCategory] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [trends, setTrends] = useState<ScoreHistoryItem[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profile, latestScore, history] = await Promise.all([
          apiFetch<UMKMProfileOut>("/umkm-profiles/me"),
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<ScoreOut[]>("/scores/me/history?limit=5"),
        ]);

        setBusinessName(profile.business_name ?? "Usaha Anda");

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setRiskCategory(getRiskCategory(displayScore));

        const d = new Date(latestScore.created_at ?? Date.now());
        setLastUpdated(
          `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        );

        const mapped: ScoreHistoryItem[] = history
          .slice()
          .reverse()
          .map((s) => ({
            month: MONTH_NAMES[new Date(s.created_at).getMonth()],
            score: Math.round(s.acs_score),
          }));
        setTrends(mapped);

        const diff =
          mapped.length >= 2
            ? mapped[mapped.length - 1].score - mapped[0].score
            : 0;
        setInsight(
          diff >= 0
            ? `Skor Anda berada dalam kategori ${getRiskCategory(displayScore)}. Konsistensi transaksi harian dan pertumbuhan omzet yang stabil menjadi faktor pendorong utama kredit Anda bulan ini.`
            : `Skor Anda perlu perhatian. Cobalah menjaga konsistensi transaksi untuk meningkatkan profil kredit Anda.`,
        );
      } catch {
        // fallback to safe defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const diffPoin =
    trends.length >= 2
      ? trends[trends.length - 1].score - trends[0].score
      : 0;

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
      {trends.length > 0 && (
        <ScoreTrend
          scoreTrends={trends}
          diffPoin={`${diffPoin >= 0 ? "+" : ""}${diffPoin} Poin`}
        />
      )}
    </div>
  );
}

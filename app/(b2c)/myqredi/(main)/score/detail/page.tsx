"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Sparkle } from "@phosphor-icons/react";
import ScoreGauge from "@/components/b2c/score/ScoreGauge";
import { apiFetch } from "@/lib/api";
import { formatScoreDate, getRiskCategory } from "@/lib/scores";
import type { LoanOutcomeOut, QrisTransactionOut, ScoreOut } from "@/lib/types";

interface ScoreFactor {
  label: string;
  value: string;
  percentage: number;
  valueColor: string;
  barColor: string;
}

/** Ambang yang sama dipakai untuk semua faktor agar warnanya konsisten. */
function gradeFactor(
  label: string,
  percentage: number,
  labels: [string, string, string] = ["Baik", "Sedang", "Rendah"],
): ScoreFactor {
  const clamped = Math.min(Math.max(Math.round(percentage), 0), 100);

  if (clamped >= 70) {
    return {
      label,
      value: labels[0],
      percentage: clamped,
      valueColor: "text-emerald-600",
      barColor: "bg-emerald-500",
    };
  }

  if (clamped >= 45) {
    return {
      label,
      value: labels[1],
      percentage: clamped,
      valueColor: "text-amber-600",
      barColor: "bg-amber-500",
    };
  }

  return {
    label,
    value: labels[2],
    percentage: clamped,
    valueColor: "text-rose-600",
    barColor: "bg-rose-500",
  };
}

const PENDING_FACTORS: ScoreFactor[] = [
  {
    label: "Konsistensi Transaksi",
    value: "Belum Ada Data",
    percentage: 0,
    valueColor: "text-muted",
    barColor: "bg-slate-300",
  },
  {
    label: "Stabilitas Omzet",
    value: "Belum Ada Data",
    percentage: 0,
    valueColor: "text-muted",
    barColor: "bg-slate-300",
  },
  {
    label: "Riwayat Pembayaran",
    value: "Belum Ada Data",
    percentage: 0,
    valueColor: "text-muted",
    barColor: "bg-slate-300",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 90;

/** Berapa persen hari dalam rentang pengamatan yang punya transaksi. */
function consistencyPercentage(transactions: QrisTransactionOut[]): number {
  if (transactions.length === 0) return 0;

  const times = transactions
    .map((t) => new Date(t.transaction_time).getTime())
    .filter((t) => !Number.isNaN(t));
  if (times.length === 0) return 0;

  const latest = Math.max(...times);
  const earliest = Math.min(...times);
  const spanDays = Math.min(
    Math.max(Math.ceil((latest - earliest) / DAY_MS) + 1, 1),
    WINDOW_DAYS,
  );
  const windowStart = latest - (spanDays - 1) * DAY_MS;

  const activeDays = new Set(
    times
      .filter((t) => t >= windowStart)
      .map((t) => Math.floor((t - windowStart) / DAY_MS)),
  );

  return (activeDays.size / spanDays) * 100;
}

/**
 * Stabilitas omzet mingguan: makin kecil sebaran omzet antar minggu, makin
 * tinggi nilainya. Dihitung dari koefisien variasi (stdev / rata-rata).
 */
function revenueStabilityPercentage(
  transactions: QrisTransactionOut[],
): number {
  const income = transactions.filter((t) => !t.is_refund);
  if (income.length === 0) return 0;

  const times = income
    .map((t) => new Date(t.transaction_time).getTime())
    .filter((t) => !Number.isNaN(t));
  if (times.length === 0) return 0;

  const latest = Math.max(...times);
  const weekly = new Map<number, number>();

  for (const t of income) {
    const time = new Date(t.transaction_time).getTime();
    if (Number.isNaN(time)) continue;
    const week = Math.floor((latest - time) / (7 * DAY_MS));
    weekly.set(week, (weekly.get(week) ?? 0) + t.amount);
  }

  const totals = [...weekly.values()];
  if (totals.length < 2) return 50;

  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  if (mean <= 0) return 0;

  const variance =
    totals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / totals.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;

  return Math.max(0, 100 - coefficientOfVariation * 100);
}

function repaymentFactor(loans: LoanOutcomeOut[]): ScoreFactor {
  if (loans.length === 0) {
    return {
      label: "Riwayat Pembayaran",
      value: "Belum Ada",
      percentage: 50,
      valueColor: "text-muted",
      barColor: "bg-slate-300",
    };
  }

  const defaulted = loans.filter((l) => l.status === "defaulted").length;
  const overdue = loans.filter((l) => l.status === "overdue").length;
  const paid = loans.filter((l) => l.status === "paid");
  const paidOnTime = paid.filter((l) => (l.days_past_due ?? 0) === 0).length;

  const settled = paid.length + overdue + defaulted;
  if (settled === 0) {
    return {
      label: "Riwayat Pembayaran",
      value: "Berjalan",
      percentage: 60,
      valueColor: "text-amber-600",
      barColor: "bg-amber-500",
    };
  }

  // Lunas tepat waktu bernilai penuh, lunas terlambat separuh, macet nol.
  const lateButPaid = paid.length - paidOnTime;
  const percentage =
    ((paidOnTime + lateButPaid * 0.5) / settled) * 100;

  return gradeFactor("Riwayat Pembayaran", percentage);
}

export default function ScoreDetailPage() {
  const [score, setScore] = useState<number>(0);
  const [riskCategory, setRiskCategory] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [factors, setFactors] = useState<ScoreFactor[]>(PENDING_FACTORS);
  const [insight, setInsight] = useState<string>(
    "Konsistensi transaksi dan stabilitas omzet menjadi faktor utama yang mendukung skor Anda saat ini.",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [latestScore, transactions, loans] = await Promise.all([
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<QrisTransactionOut[]>(
            "/qris-transactions/me?limit=1000",
          ).catch(() => [] as QrisTransactionOut[]),
          apiFetch<LoanOutcomeOut[]>("/loans/by-borrower/me").catch(
            () => [] as LoanOutcomeOut[],
          ),
        ]);

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setRiskCategory(getRiskCategory(displayScore));
        setLastUpdated(formatScoreDate(latestScore.created_at));

        if (transactions.length === 0) {
          setFactors([PENDING_FACTORS[0], PENDING_FACTORS[1], repaymentFactor(loans)]);
          return;
        }

        const consistency = gradeFactor(
          "Konsistensi Transaksi",
          consistencyPercentage(transactions),
        );
        const stability = gradeFactor(
          "Stabilitas Omzet",
          revenueStabilityPercentage(transactions),
        );
        const repayment = repaymentFactor(loans);

        setFactors([consistency, stability, repayment]);

        const strongest = [consistency, stability, repayment].reduce((a, b) =>
          b.percentage > a.percentage ? b : a,
        );
        const weakest = [consistency, stability, repayment].reduce((a, b) =>
          b.percentage < a.percentage ? b : a,
        );

        setInsight(
          strongest.label === weakest.label
            ? `Skor Anda ditopang oleh ${strongest.label.toLowerCase()} dari ${transactions.length.toLocaleString("id-ID")} transaksi QRIS terakhir.`
            : `${strongest.label} menjadi faktor terkuat Anda, sementara ${weakest.label.toLowerCase()} masih paling bisa ditingkatkan. Dihitung dari ${transactions.length.toLocaleString("id-ID")} transaksi QRIS terakhir.`,
        );
      } catch {
        setFactors(PENDING_FACTORS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
          {insight}
        </p>
      </div>
    </div>
  );
}

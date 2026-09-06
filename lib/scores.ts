/**
 * Turunan data dari riwayat skor ACS.
 *
 * Catatan penting soal backend: `ScoreOut` (`GET /scores/me/history`) tidak
 * mengirim `created_at`, padahal kolomnya ada di tabel `scores` dan dipakai
 * backend untuk mengurutkan (terbaru dulu). Akibatnya FE tahu *urutan* tiap
 * penilaian tapi tidak tahu *tanggalnya*.
 *
 * Modul ini menangani dua kondisi sekaligus:
 * - kalau `created_at` tersedia (backend menambahkannya nanti) -> sumbu bulan asli;
 * - kalau tidak -> sumbu penilaian ke-N, bukan bulan karangan.
 */

import { apiFetch } from "./api";
import type { QrisTransactionOut, RiskLevel, ScoreOut } from "./types";

export const MONTH_NAMES = [
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

export const TREND_POINTS = 5;

export interface ScorePoint {
  month: string;
  score: number;
}

export interface ScoreTrend {
  points: ScorePoint[];
  /** Selisih skor pertama ke terakhir pada rentang yang ditampilkan. */
  diff: number;
  /** true kalau label memakai bulan asli dari `created_at`. */
  hasDates: boolean;
  /** true kalau semua penilaian menghasilkan skor yang sama. */
  isFlat: boolean;
}

export function formatScoreDate(value: string | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function getRiskCategory(score: number): string {
  if (score >= 70) return "Baik";
  if (score >= 50) return "Sedang";
  return "Rendah";
}

/**
 * Susun titik-titik grafik dari riwayat skor.
 *
 * `history` datang dari backend dengan urutan terbaru lebih dulu.
 */
export function buildScoreTrend(
  history: ScoreOut[],
  maxPoints: number = TREND_POINTS,
): ScoreTrend {
  const ordered = [...history].reverse(); // jadi terlama -> terbaru
  const recent = ordered.slice(-maxPoints);

  if (recent.length === 0) {
    return { points: [], diff: 0, hasDates: false, isFlat: true };
  }

  const hasDates = recent.every((s) => {
    if (!s.created_at) return false;
    return !Number.isNaN(new Date(s.created_at).getTime());
  });

  // Tanpa `created_at` dari backend, penilaian dipetakan ke N bulan terakhir
  // (yang terbaru = bulan berjalan). Urutannya nyata, tanggalnya perkiraan.
  const now = new Date();
  const monthLabel = (index: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (recent.length - 1 - index), 1);
    return MONTH_NAMES[d.getMonth()];
  };

  const points: ScorePoint[] = recent.map((s, index) => ({
    month: hasDates
      ? MONTH_NAMES[new Date(s.created_at as string).getMonth()]
      : monthLabel(index),
    score: Math.round(s.acs_score),
  }));

  const scores = points.map((p) => p.score);
  const diff = scores[scores.length - 1] - scores[0];
  const isFlat = scores.every((s) => s === scores[0]);

  return { points, diff, hasDates, isFlat };
}

/** Teks insight yang menjelaskan kondisi skor apa adanya. */
export function buildInsight(score: number, trend: ScoreTrend): string {
  const category = getRiskCategory(score);

  if (trend.points.length < 2) {
    return `Skor Anda berada dalam kategori ${category}. Riwayat penilaian Anda baru tersedia satu kali, jadi perkembangan skor belum bisa ditampilkan. Jaga konsistensi transaksi QRIS agar penilaian berikutnya lebih akurat.`;
  }

  if (trend.isFlat) {
    return `Skor Anda berada dalam kategori ${category} dan belum berubah sejak ${trend.points.length} penilaian terakhir. Tambah volume dan konsistensi transaksi harian agar penilaian berikutnya bisa bergerak naik.`;
  }

  if (trend.diff > 0) {
    return `Skor Anda naik ${trend.diff} poin dan kini berada dalam kategori ${category}. Konsistensi transaksi harian dan pertumbuhan omzet yang stabil menjadi faktor pendorong utama kredit Anda.`;
  }

  return `Skor Anda turun ${Math.abs(trend.diff)} poin dan kini berada dalam kategori ${category}. Cobalah menjaga konsistensi transaksi harian untuk memperbaiki profil kredit Anda.`;
}

// ---------------------------------------------------------------------------
// KPI ringkas di halaman Skor (Konsistensi / Aktivitas / Risiko / Periode)
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_PER_MONTH = 30.44;

export interface ScoreKpi {
  id: string;
  label: string;
  value: string;
  valueColor: string;
}

function times(transactions: QrisTransactionOut[]): number[] {
  return transactions
    .map((t) => new Date(t.transaction_time).getTime())
    .filter((t) => !Number.isNaN(t));
}

/** Persen hari yang punya transaksi dalam rentang data yang diambil. */
export function consistencyPercentage(
  transactions: QrisTransactionOut[],
): number {
  const ts = times(transactions);
  if (ts.length === 0) return 0;

  const latest = Math.max(...ts);
  const earliest = Math.min(...ts);
  const spanDays = Math.max(Math.ceil((latest - earliest) / DAY_MS) + 1, 1);
  const activeDays = new Set(ts.map((t) => Math.floor((t - earliest) / DAY_MS)));

  return (activeDays.size / spanDays) * 100;
}

/** Rata-rata transaksi per hari pada rentang data yang diambil. */
export function transactionsPerDay(
  transactions: QrisTransactionOut[],
): number {
  const ts = times(transactions);
  if (ts.length === 0) return 0;

  const spanDays = Math.max(
    Math.ceil((Math.max(...ts) - Math.min(...ts)) / DAY_MS) + 1,
    1,
  );
  return transactions.length / spanDays;
}

function consistencyLabel(percentage: number): { value: string; color: string } {
  if (percentage >= 85) return { value: "Sangat Tinggi", color: "text-emerald-600" };
  if (percentage >= 70) return { value: "Tinggi", color: "text-emerald-600" };
  if (percentage >= 45) return { value: "Sedang", color: "text-amber-600" };
  return { value: "Rendah", color: "text-rose-600" };
}

/** `risk_level` dari backend, dalam bahasa Indonesia. */
export function riskLabel(risk: RiskLevel): { value: string; color: string } {
  if (risk === "low") return { value: "Rendah", color: "text-emerald-600" };
  if (risk === "medium") return { value: "Sedang", color: "text-amber-600" };
  return { value: "Tinggi", color: "text-rose-600" };
}

export function monthsBetween(oldest: string, newest: string): number {
  const a = new Date(oldest).getTime();
  const b = new Date(newest).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(Math.round((b - a) / DAY_MS / DAYS_PER_MONTH), 1);
}

export function buildScoreKpis(
  transactions: QrisTransactionOut[],
  risk: RiskLevel | null,
  periodMonths: number | null,
): ScoreKpi[] {
  const consistency = consistencyLabel(consistencyPercentage(transactions));
  const perDay = transactionsPerDay(transactions);
  const riskText = risk ? riskLabel(risk) : { value: "-", color: "text-muted" };

  return [
    {
      id: "consistency",
      label: "Konsistensi Transaksi",
      value: transactions.length > 0 ? consistency.value : "-",
      valueColor: transactions.length > 0 ? consistency.color : "text-muted",
    },
    {
      id: "activity",
      label: "Aktivitas Transaksi",
      value: perDay > 0 ? `${Math.round(perDay)} tx / hari` : "-",
      valueColor: "text-foreground",
    },
    {
      id: "risk",
      label: "Risiko",
      value: riskText.value,
      valueColor: riskText.color,
    },
    {
      id: "period",
      label: "Periode Data QRIS",
      value: periodMonths ? `${periodMonths} Bulan` : "-",
      valueColor: "text-foreground",
    },
  ];
}

/**
 * Cari transaksi QRIS tertua milik user yang login.
 *
 * `GET /qris-transactions/me` mengurutkan dari yang terbaru dan hanya menerima
 * `skip`/`limit` — tidak ada endpoint jumlah data. Menarik seluruh riwayat
 * hanya demi tanggal tertua terlalu berat (~760 KB untuk merchant aktif), jadi
 * posisinya dicari lewat dua putaran probe `limit=1` yang dijalankan paralel:
 * putaran pertama menentukan rentang, putaran kedua mempersempitnya.
 *
 * `fallback` dipakai kalau semua probe kosong — artinya seluruh riwayat sudah
 * termuat di halaman pertama yang dipanggil pemanggil.
 */
export async function findOldestTransactionTime(
  fallback: QrisTransactionOut[] = [],
): Promise<string | null> {
  const probe = async (skip: number): Promise<string | null> => {
    const rows = await apiFetch<QrisTransactionOut[]>(
      `/qris-transactions/me?limit=1&skip=${skip}`,
    ).catch(() => null);
    return rows && rows.length > 0 ? rows[0].transaction_time : null;
  };

  const LADDER = [1000, 2000, 3000, 4000, 6000, 8000, 12000];
  const coarse = await Promise.all(LADDER.map(probe));

  let lo = 0;
  let oldest: string | null = null;
  let hi = LADDER[0];

  for (let i = 0; i < LADDER.length; i++) {
    if (coarse[i]) {
      lo = LADDER[i];
      oldest = coarse[i];
      hi = LADDER[i + 1] ?? LADDER[i] * 2;
    } else {
      hi = LADDER[i];
      break;
    }
  }

  const STEPS = 16;
  const step = Math.floor((hi - lo) / (STEPS + 1));
  if (step >= 1) {
    const offsets = Array.from({ length: STEPS }, (_, k) => lo + (k + 1) * step);
    const fine = await Promise.all(offsets.map(probe));
    for (let k = STEPS - 1; k >= 0; k--) {
      if (fine[k]) {
        oldest = fine[k];
        break;
      }
    }
  }

  if (oldest) return oldest;

  // Riwayatnya pendek — seluruhnya sudah ada di data yang dipegang pemanggil.
  const ts = times(fallback);
  return ts.length > 0 ? new Date(Math.min(...ts)).toISOString() : null;
}

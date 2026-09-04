"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Info,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import {
  applicationsForUmkm,
  applicationsStore,
} from "@/lib/applications-store";
import { defaultRequestedAmount, submitApplication } from "@/lib/financing";
import {
  formatRupiah,
  getLenderProduct,
  getMatchScore,
  type LenderProduct,
} from "@/lib/lenders";
import type { MatchStatus, ScoreOut, UMKMProfileOut } from "@/lib/types";

const STATUS_LABELS: Record<MatchStatus, string> = {
  pending: "Menunggu Review Lender",
  accepted: "Disetujui",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
};

function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export default function FinancingDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { user } = useAuth();

  const [score, setScore] = useState<ScoreOut | null>(null);
  const [profile, setProfile] = useState<UMKMProfileOut | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [selectedTenor, setSelectedTenor] = useState<number | null>(null);

  // Produk berasal dari katalog statis, jadi cukup diturunkan saat render.
  const product = useMemo<LenderProduct | undefined>(
    () => getLenderProduct(productId),
    [productId],
  );
  const tenor = selectedTenor ?? product?.tenorMonths[0] ?? 0;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const allApplications = useSyncExternalStore(
    applicationsStore.subscribe,
    applicationsStore.getSnapshot,
    applicationsStore.getServerSnapshot,
  );

  const existingApplication = useMemo(
    () =>
      applicationsForUmkm(allApplications, user?.id).find(
        (a) => a.productId === productId,
      ),
    [allApplications, user?.id, productId],
  );

  useEffect(() => {
    async function load() {
      try {
        const [latestScore, umkmProfile] = await Promise.all([
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<UMKMProfileOut>("/umkm-profiles/me").catch(() => null),
        ]);

        setScore(latestScore);
        setProfile(umkmProfile);

        if (product) {
          setAmountInput(
            String(
              defaultRequestedAmount(
                Math.round(latestScore.acs_score),
                product,
              ),
            ),
          );
        }
      } catch {
        // biarkan kosong; form pengajuan akan dinonaktifkan
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [product]);

  const displayScore = score ? Math.round(score.acs_score) : 0;
  const matchScore = product ? getMatchScore(displayScore, product) : 0;
  const requestedAmount = parseAmount(amountInput);
  const amountTooHigh = product ? requestedAmount > product.maxLimit : false;
  const amountTooLow = requestedAmount < 1_000_000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !user || !score) return;

    setError("");
    setSubmitting(true);
    try {
      await submitApplication({
        user,
        profile,
        score,
        product,
        requestedAmount,
        tenorMonths: tenor,
      });
    } catch {
      setError("Pengajuan gagal dikirim. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-40 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-56 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/myqredi/financing"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-background"
            aria-label="Kembali"
          >
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Pembiayaan</h1>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 text-center text-muted shadow-sm">
          Produk pembiayaan tidak ditemukan.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <Link
          href="/myqredi/financing"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-background"
          aria-label="Kembali"
        >
          <ArrowLeft size={18} weight="bold" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">
          Detail Pembiayaan
        </h1>
      </div>

      {/* Ringkasan Produk */}
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-base font-bold text-emerald-700">
            {product.initial}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-foreground">
              {product.title}
            </h2>
            <p className="truncate text-sm font-medium text-muted">
              {product.institution}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/60 pt-3">
          <div className="space-y-0.5 pr-2">
            <span className="text-xs font-medium text-muted">Plafon Maks</span>
            <p className="truncate text-sm font-bold text-foreground">
              {formatRupiah(product.maxLimit)}
            </p>
          </div>
          <div className="space-y-0.5 px-3">
            <span className="text-xs font-medium text-muted">Bunga</span>
            <p className="truncate text-sm font-bold text-foreground">
              {product.interestRate}%
            </p>
          </div>
          <div className="space-y-0.5 pl-3">
            <span className="text-xs font-medium text-muted">Kecocokan</span>
            <p className="truncate text-sm font-bold text-emerald-600">
              {matchScore}%
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/80">
          {product.description}
        </p>
      </div>

      {/* Syarat */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-base font-bold text-foreground">
          Syarat Pengajuan
        </h3>
        <ul className="mt-3 space-y-2">
          {product.requirements.map((requirement) => (
            <li
              key={requirement}
              className="flex items-start gap-2 text-sm text-foreground/80"
            >
              <CheckCircle
                size={16}
                weight="fill"
                className="mt-0.5 shrink-0 text-emerald-500"
              />
              <span>{requirement}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle
              size={16}
              weight="fill"
              className={`mt-0.5 shrink-0 ${
                displayScore >= product.minScore
                  ? "text-emerald-500"
                  : "text-slate-300"
              }`}
            />
            <span>
              Skor Qredi minimal {product.minScore} &mdash; skor Anda saat ini{" "}
              <span className="font-semibold text-foreground">
                {displayScore}
              </span>
            </span>
          </li>
        </ul>
      </section>

      {/* Pengajuan */}
      {existingApplication ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-base font-semibold text-emerald-700">
            <CheckCircle size={18} weight="fill" />
            <span>Pengajuan Terkirim</span>
          </div>

          <div className="mt-3 space-y-2 text-sm text-foreground/80">
            <div className="flex justify-between gap-3">
              <span className="text-muted">Nominal diajukan</span>
              <span className="font-semibold text-foreground">
                {formatRupiah(existingApplication.requestedAmount)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Tenor</span>
              <span className="font-semibold text-foreground">
                {existingApplication.tenorMonths} bulan
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Status</span>
              <span className="font-semibold text-foreground">
                {STATUS_LABELS[existingApplication.status]}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted">Diajukan pada</span>
              <span className="font-semibold text-foreground">
                {new Date(existingApplication.submittedAt).toLocaleString(
                  "id-ID",
                  { dateStyle: "medium", timeStyle: "short" },
                )}
              </span>
            </div>
          </div>

          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-emerald-800">
            <Info size={14} weight="fill" className="mt-0.5 shrink-0" />
            <span>
              Data usaha dan skor Anda sudah diteruskan ke {product.institution}.
              Lender akan meninjau pengajuan ini melalui Qredi Dashboard.
            </span>
          </p>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        >
          <h3 className="text-base font-bold text-foreground">
            Ajukan Pembiayaan
          </h3>

          <div className="space-y-1.5">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-foreground"
            >
              Nominal Pengajuan
            </label>
            <input
              id="amount"
              inputMode="numeric"
              value={
                requestedAmount ? requestedAmount.toLocaleString("id-ID") : ""
              }
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-semibold text-foreground outline-none transition-colors focus:border-primary"
            />
            <p className="text-xs text-muted">
              Maksimal {formatRupiah(product.maxLimit)}
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="tenor"
              className="text-sm font-medium text-foreground"
            >
              Tenor
            </label>
            <select
              id="tenor"
              value={tenor}
              onChange={(e) => setSelectedTenor(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {product.tenorMonths.map((months) => (
                <option key={months} value={months}>
                  {months} bulan
                </option>
              ))}
            </select>
          </div>

          {amountTooHigh && (
            <p className="text-sm text-rose-600">
              Nominal melebihi plafon maksimal produk ini.
            </p>
          )}
          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !score || amountTooHigh || amountTooLow}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-surface transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperPlaneTilt size={18} weight="fill" />
            <span>{submitting ? "Mengirim..." : "Ajukan Sekarang"}</span>
          </button>

          <p className="text-center text-xs leading-relaxed text-muted">
            Dengan mengajukan, skor Qredi dan ringkasan usaha Anda dibagikan ke{" "}
            {product.institution}.
          </p>
        </form>
      )}
    </div>
  );
}

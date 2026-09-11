"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import FinancingCard from "@/components/b2c/financing/FinancingCard";
import type { FinancingItem } from "@/components/b2c/financing/FinancingCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
// import {
//   applicationsForUmkm,
//   applicationsStore,
// } from "@/lib/applications-store";
import { defaultRequestedAmount, submitApplication } from "@/lib/financing";
import { formatJuta, loadLenderProducts, type LenderProduct } from "@/lib/lenders";
import { getRiskCategory } from "@/lib/scores";
import type { MatchStatus, MatchOut, ScoreOut, UMKMProfileOut } from "@/lib/types";

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
// function backendMatchToItem(match: MatchOut): FinancingItem {
//   const product = LENDER_PRODUCTS.find((p) =>
//     match.reason?.startsWith(p.title),
//   );

//   return {
//     id: match.id,
//     initial: product?.initial ?? "M",
//     title: product?.title ?? "Pembiayaan UMKM",
//     institution: product?.institution ?? "Mitra Keuangan",
//     plafon: match.recommended_limit
//       ? formatJuta(match.recommended_limit)
//       : "Hubungi Lender",
//     interest:
//       match.recommended_interest != null
//         ? `${match.recommended_interest}%`
//         : "-",
//     matchScore:
//       match.match_score != null
//         ? `${Math.round(match.match_score * 100)}%`
//         : "-",
//     statusLabel: STATUS_LABELS[match.status],
//     statusTone: statusTone(match.status),
//   };
// }

export default function FinancingPage() {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [rawScore, setRawScore] = useState<ScoreOut | null>(null);
  const [profile, setProfile] = useState<UMKMProfileOut | null>(null);
  const [category, setCategory] = useState<string>("");
  const [backendMatches, setBackendMatches] = useState<MatchOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [products, setProducts] = useState<LenderProduct[]>([]);


  // const allApplications = useSyncExternalStore(
  //   applicationsStore.subscribe,
  //   applicationsStore.getSnapshot,
  //   applicationsStore.getServerSnapshot,
  // );

  // const myApplications = useMemo(
  //   () => applicationsForUmkm(allApplications, user?.id),
  //   [allApplications, user?.id],
  // );

  useEffect(() => {
    async function load() {
      try {
        const [latestScore, matches, umkmProfile, lenderProducts] = await Promise.all([
          apiFetch<ScoreOut>("/scores/me/latest"),
          apiFetch<MatchOut[]>("/matches/by-umkm/me").catch(() => [] as MatchOut[]),
          apiFetch<UMKMProfileOut>("/umkm-profiles/me").catch(() => null),
          loadLenderProducts(),
        ]);

        const displayScore = Math.round(latestScore.acs_score);
        setScore(displayScore);
        setRawScore(latestScore);
        setProfile(umkmProfile);
        setCategory(getRiskCategory(displayScore));
        setBackendMatches(matches);
        setProducts(lenderProducts);
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleApply(item: FinancingItem) {
    const product = products.find((p) => p.id === item.id);
    if (!product || !user || !rawScore) {
      setNotification({
        type: "error",
        message: "Data profil atau skor kredit belum tersedia. Silakan coba lagi.",
      });
      return;
    }

    setApplyingId(item.id);
    setNotification(null);

    try {
      const acsScore = Math.round(rawScore.acs_score);
      const requestedAmount = defaultRequestedAmount(acsScore, product);
      const tenorMonths = 6; // tidak ada field tenor di LenderProfile, default sementara

      await submitApplication({
        user,
        profile,
        score: rawScore,
        product,
        requestedAmount,
        tenorMonths,
      });

      setNotification({
        type: "success",
        message: `Pengajuan ${product.institution} (${formatJuta(requestedAmount)}) berhasil diajukan!`,
      });
    } catch {
      setNotification({
        type: "error",
        message: "Pengajuan gagal dikirim. Silakan coba lagi.",
      });
    } finally {
      setApplyingId(null);
    }
  }

  const items = useMemo<FinancingItem[]>(() => {
  const matchByLender = new Map(backendMatches.map((m) => [m.lender_id, m]));

  return products.map((product) => {
    const match = matchByLender.get(product.lenderId);

    return {
      id: product.id,
      initial: product.institution.charAt(0).toUpperCase(),
      title: product.institution,
      institution: product.institution,
      plafon: match?.recommended_limit
        ? formatJuta(match.recommended_limit)
        : product.maxLimit
          ? formatJuta(product.maxLimit)
          : "Hubungi Lender",
      interest:
        match?.recommended_interest != null
          ? `${match.recommended_interest}%`
          : "-",
      matchScore:
        match?.match_score != null
          ? `${Math.round(match.match_score * 100)}%`
          : `${score}%`,
      statusLabel: match ? STATUS_LABELS[match.status] : undefined,
      statusTone: match ? statusTone(match.status) : undefined,
    } satisfies FinancingItem;
  });
}, [products, backendMatches, score]);

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
      {/* Alert Notification */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-medium border shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={20} weight="fill" className="shrink-0 text-emerald-600" />
          ) : (
            <WarningCircle size={20} weight="fill" className="shrink-0 text-rose-600" />
          )}
          <span className="flex-1 leading-snug">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 rounded-md text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>
      )}

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
              <FinancingCard
                key={item.id}
                item={item}
                onApply={handleApply}
                isApplying={applyingId === item.id}
              />
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

"use client";

import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";

export interface FinancingItem {
  id: string;
  initial: string;
  title: string;
  institution: string;
  plafon: string;
  interest: string;
  matchScore: string;
  detailUrl?: string;
  /** Diisi hanya kalau UMKM sudah mengajukan produk ini. */
  statusLabel?: string;
  statusTone?: "pending" | "accepted" | "rejected";
}

interface FinancingCardProps {
  item: FinancingItem;
  onApply?: (item: FinancingItem) => void;
  isApplying?: boolean;
}

const STATUS_TONES: Record<
  NonNullable<FinancingItem["statusTone"]>,
  string
> = {
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  accepted: "text-emerald-700 bg-emerald-50 border-emerald-200",
  rejected: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function FinancingCard({
  item,
  onApply,
  isApplying = false,
}: FinancingCardProps) {
  const isApplied = Boolean(item.statusLabel);

  return (
    <div className="border border-border bg-surface p-5 rounded-2xl shadow-sm space-y-4">
      {/* 1. Header Produk & Lembaga */}
      <div className="flex items-center gap-3">
        {/* Avatar Inisial */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold text-base border border-emerald-100">
          {item.initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-foreground truncate">
            {item.title}
          </h3>
          <p className="text-sm text-muted font-medium truncate">
            {item.institution}
          </p>
        </div>

        {item.statusLabel && (
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              STATUS_TONES[item.statusTone ?? "pending"]
            }`}
          >
            {item.statusLabel}
          </span>
        )}
      </div>

      {/* 2. Grid 3 Kolom (Plafon, Bunga, Kecocokan) */}
      <div className="grid grid-cols-3 pt-3 border-t border-border/60 divide-x divide-border/60">
        {/* Plafon */}
        <div className="pr-2 space-y-0.5">
          <span className="text-xs text-muted font-medium">Plafon</span>
          <p className="text-sm font-bold text-foreground truncate">
            {item.plafon}
          </p>
        </div>

        {/* Bunga */}
        <div className="px-3 space-y-0.5">
          <span className="text-xs text-muted font-medium">Bunga</span>
          <p className="text-sm font-bold text-foreground truncate">
            {item.interest}
          </p>
        </div>

        {/* Kecocokan */}
        <div className="pl-3 space-y-0.5">
          <span className="text-xs text-muted font-medium">Kecocokan</span>
          <p className="text-sm font-bold text-emerald-600 truncate">
            {item.matchScore}
          </p>
        </div>
      </div>

      {/* 3. Action Button: Ajukan Sekarang / Sudah Diajukan */}
      <div className="pt-2 border-t border-border/60">
        {isApplied ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 py-2.5 px-4 text-sm font-semibold text-muted">
            <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0" />
            <span>Sudah Diajukan ({item.statusLabel})</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onApply?.(item)}
            disabled={isApplying}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-sm font-semibold text-white transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <PaperPlaneTilt size={16} weight="fill" />
            <span>{isApplying ? "Mengajukan..." : "Ajukan Sekarang"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

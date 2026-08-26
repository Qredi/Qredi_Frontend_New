"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export interface FinancingItem {
  id: string;
  initial: string;
  title: string;
  institution: string;
  plafon: string;
  interest: string;
  matchScore: string;
  detailUrl: string;
}

interface FinancingCardProps {
  item: FinancingItem;
}

export default function FinancingCard({ item }: FinancingCardProps) {
  return (
    <div className="border border-border bg-surface p-5 rounded-2xl shadow-sm space-y-4">
      {/* 1. Header Produk & Lembaga */}
      <div className="flex items-center gap-3">
        {/* Avatar Inisial */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold text-base border border-emerald-100">
          {item.initial}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-foreground truncate">
            {item.title}
          </h3>
          <p className="text-sm text-muted font-medium truncate">
            {item.institution}
          </p>
        </div>
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

      {/* 3. Footer Action Button */}
      <div className="pt-1">
        <Link
          href={item.detailUrl}
          className="flex items-center justify-between text-teal-700 hover:text-teal-800 text-sm font-semibold pt-2 border-t border-border/40 transition-colors"
        >
          <span>Lihat Selengkapnya</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
}

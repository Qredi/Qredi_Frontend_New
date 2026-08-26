"use client";

import {
  CheckCircle,
  Warning,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";

export interface ShapFactor {
  id: string;
  featureName: string;
  metricValue: string; // Misal: "42 tx / hari"
  impactValue: number; // Misal: +8 atau -3
  description: string;
}

interface ShapFactorBarProps {
  factor: ShapFactor;
}

export default function ShapFactorBar({ factor }: ShapFactorBarProps) {
  const isPositive = factor.impactValue >= 0;

  return (
    <div className="border border-border bg-surface p-4 rounded-2xl shadow-sm space-y-3">
      {/* Header Factors & Badge Impact */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {factor.featureName}
          </h3>
          <p className="text-xs font-semibold text-muted mt-0.5">
            Nilai Anda:{" "}
            <span className="text-foreground">{factor.metricValue}</span>
          </p>
        </div>

        {/* Impact Badge SHAP (+X Poin / -X Poin) */}
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
            isPositive
              ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
              : "text-rose-700 bg-rose-50 border border-rose-200"
          }`}
        >
          {isPositive ? (
            <CaretUp size={14} weight="bold" />
          ) : (
            <CaretDown size={14} weight="bold" />
          )}
          {isPositive ? `+${factor.impactValue}` : factor.impactValue} Poin
        </span>
      </div>

      {/* SHAP Progress Visual Indicator */}
      <div className="space-y-1">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
          {isPositive ? (
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(factor.impactValue * 6, 100)}%` }}
            />
          ) : (
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.abs(factor.impactValue) * 6, 100)}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Deskripsi Penjelasan SHAP */}
      <p className="text-xs text-muted leading-relaxed font-normal pt-0.5">
        {factor.description}
      </p>
    </div>
  );
}

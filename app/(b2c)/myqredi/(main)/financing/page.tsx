"use client";

import FinancingCard, {
  FinancingItem,
} from "@/components/b2c/financing/FinancingCard";

const MOCK_SCORE_SUMMARY = {
  score: 82,
  category: "Baik",
};

const MOCK_FINANCING_DATA: FinancingItem[] = [
  {
    id: "kur-mikro-digital",
    initial: "B",
    title: "KUR Mikro Digital",
    institution: "Bank Contoh",
    plafon: "Rp50 Juta",
    interest: "6%",
    matchScore: "92%",
    detailUrl: "/myqredi/financing/kur-mikro-digital",
  },
  {
    id: "modal-usaha",
    initial: "F",
    title: "Modal Usaha",
    institution: "Fintech Contoh",
    plafon: "Rp100 Juta",
    interest: "8%",
    matchScore: "87%",
    detailUrl: "/myqredi/financing/modal-usaha",
  },
  {
    id: "dana-operasional",
    initial: "M",
    title: "Dana Operasional UMKM",
    institution: "Mitra Keuangan",
    plafon: "Rp25 Juta",
    interest: "7%",
    matchScore: "82%",
    detailUrl: "/myqredi/financing/dana-operasional",
  },
];

export default function FinancingPage() {
  const { score, category } = MOCK_SCORE_SUMMARY;

  return (
    <div className="space-y-6">
      {/* Card Ringkasan Skor Atas (Sesuai Referensi Gambar) */}
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

        {/* Progress Bar Horizontal (0 - 100) */}
        {/* <div className="space-y-1 pt-1">
          <div className="w-full bg-slate-100 rounded-sm h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-sm transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-2">
            <span>0</span>
            <span>100</span>
          </div>
        </div> */}
      </div>

      {/* Section Rekomendasi Untuk Anda */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground px-0.5">
          Rekomendasi Untuk Anda
        </h2>

        <div className="space-y-4">
          {MOCK_FINANCING_DATA.map((item) => (
            <FinancingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

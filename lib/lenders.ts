/**
 * Katalog produk pembiayaan.
 *
 * Backend belum punya tabel/endpoint "produk lender" (yang ada hanya
 * `lender_profiles` + `matches`), jadi katalog ini dipakai sebagai sumber
 * produk yang bisa diajukan UMKM. Begitu backend menyediakan endpoint produk,
 * `LENDER_PRODUCTS` tinggal diganti hasil fetch — bentuk datanya sudah sama.
 */

export interface LenderProduct {
  id: string;
  initial: string;
  title: string;
  institution: string;
  /** Plafon maksimum dalam rupiah. */
  maxLimit: number;
  /** Bunga tahunan dalam persen. */
  interestRate: number;
  /** Skor ACS minimum yang diterima produk ini. */
  minScore: number;
  /** Pilihan tenor (bulan); indeks 0 dipakai sebagai default pengajuan. */
  tenorMonths: number[];
  description: string;
  requirements: string[];
}

export const LENDER_PRODUCTS: LenderProduct[] = [
  {
    id: "kur-mikro-digital",
    initial: "B",
    title: "KUR Mikro Digital",
    institution: "Bank Contoh",
    maxLimit: 50_000_000,
    interestRate: 6,
    minScore: 70,
    tenorMonths: [6, 12, 24],
    description:
      "Kredit Usaha Rakyat dengan bunga subsidi untuk UMKM yang sudah punya riwayat transaksi QRIS stabil.",
    requirements: [
      "Usaha berjalan minimal 6 bulan",
      "Transaksi QRIS aktif 3 bulan terakhir",
      "Tidak sedang menunggak pinjaman lain",
    ],
  },
  {
    id: "modal-usaha",
    initial: "F",
    title: "Modal Usaha",
    institution: "Fintech Contoh",
    maxLimit: 100_000_000,
    interestRate: 8,
    minScore: 55,
    tenorMonths: [3, 6, 12],
    description:
      "Pembiayaan modal kerja pencairan cepat, cocok untuk kebutuhan restock dan ekspansi jangka pendek.",
    requirements: [
      "Usaha berjalan minimal 3 bulan",
      "Rata-rata omzet bulanan minimal Rp 5 juta",
      "KTP dan data usaha terverifikasi",
    ],
  },
  {
    id: "dana-operasional",
    initial: "M",
    title: "Dana Operasional UMKM",
    institution: "Mitra Keuangan",
    maxLimit: 25_000_000,
    interestRate: 7,
    minScore: 40,
    tenorMonths: [3, 6],
    description:
      "Dana operasional harian dengan syarat ringan untuk UMKM yang baru mulai membangun profil kredit.",
    requirements: [
      "Terdaftar sebagai merchant QRIS",
      "Minimal 30 transaksi dalam 30 hari terakhir",
    ],
  },
];

export function getLenderProduct(id: string): LenderProduct | undefined {
  return LENDER_PRODUCTS.find((p) => p.id === id);
}

/**
 * Kecocokan UMKM terhadap sebuah produk, 0-100.
 *
 * Dihitung dari skor ACS asli (bukan angka statis): semakin jauh skor di atas
 * `minScore` produk, semakin tinggi kecocokannya. Di bawah `minScore`
 * kecocokan turun tajam supaya produk yang belum layak tetap terlihat rendah.
 */
export function getMatchScore(acsScore: number, product: LenderProduct): number {
  const headroom = acsScore - product.minScore;

  if (headroom >= 0) {
    const span = Math.max(100 - product.minScore, 1);
    return Math.round(Math.min(60 + (headroom / span) * 40, 99));
  }

  return Math.round(Math.max(60 + headroom * 2, 5));
}

/** Plafon yang ditawarkan ke UMKM ini — dibatasi kelayakan skornya. */
export function getOfferedLimit(
  acsScore: number,
  product: LenderProduct,
): number {
  const ratio = Math.min(Math.max(acsScore, 0), 100) / 100;
  const raw = product.maxLimit * (0.4 + 0.6 * ratio);
  // Bulatkan ke juta terdekat supaya angkanya enak dibaca.
  return Math.max(Math.round(raw / 1_000_000) * 1_000_000, 1_000_000);
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/** "Rp50 Juta" — format ringkas yang dipakai di kartu rekomendasi. */
export function formatJuta(amount: number): string {
  return `Rp${Math.round(amount / 1_000_000)} Juta`;
}

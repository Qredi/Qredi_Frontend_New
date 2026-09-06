"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Buildings,
  CaretRight,
  Check,
  PencilSimple,
  Receipt,
  SignOut,
  Storefront,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/lenders";
import { getRiskCategory } from "@/lib/scores";
import type {
  LoanOutcomeOut,
  QrisTransactionOut,
  ScoreOut,
  UMKMProfileOut,
} from "@/lib/types";

interface ProfileForm {
  business_name: string;
  business_type: string;
  city: string;
  province: string;
  monthly_revenue: string;
  years_operating: string;
  employee_count: string;
}

const EMPTY_FORM: ProfileForm = {
  business_name: "",
  business_type: "",
  city: "",
  province: "",
  monthly_revenue: "",
  years_operating: "",
  employee_count: "",
};

function toForm(profile: UMKMProfileOut | null): ProfileForm {
  if (!profile) return EMPTY_FORM;
  return {
    business_name: profile.business_name ?? "",
    business_type: profile.business_type ?? "",
    city: profile.city ?? "",
    province: profile.province ?? "",
    monthly_revenue:
      profile.monthly_revenue != null ? String(profile.monthly_revenue) : "",
    years_operating:
      profile.years_operating != null ? String(profile.years_operating) : "",
    employee_count:
      profile.employee_count != null ? String(profile.employee_count) : "",
  };
}

/** Hanya kirim field yang diisi — semua field di `UMKMProfileIn` opsional. */
function toPayload(form: ProfileForm) {
  const number = (value: string) => {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return value.trim() && Number.isFinite(parsed) ? parsed : null;
  };

  return {
    business_name: form.business_name.trim() || null,
    business_type: form.business_type.trim() || null,
    city: form.city.trim() || null,
    province: form.province.trim() || null,
    monthly_revenue: number(form.monthly_revenue),
    years_operating: number(form.years_operating),
    employee_count: number(form.employee_count),
  };
}

const FIELDS: { key: keyof ProfileForm; label: string; suffix?: string }[] = [
  { key: "business_name", label: "Nama Usaha" },
  { key: "business_type", label: "Jenis Usaha" },
  { key: "city", label: "Kota" },
  { key: "province", label: "Provinsi" },
  { key: "monthly_revenue", label: "Omzet Bulanan" },
  { key: "years_operating", label: "Lama Usaha", suffix: "tahun" },
  { key: "employee_count", label: "Jumlah Karyawan", suffix: "orang" },
];

function displayValue(
  key: keyof ProfileForm,
  form: ProfileForm,
  suffix?: string,
): string {
  const raw = form[key];
  if (!raw) return "-";
  if (key === "monthly_revenue") return formatRupiah(Number(raw));
  return suffix ? `${raw} ${suffix}` : raw;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<UMKMProfileOut | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    tone: "ok" | "error";
    text: string;
  } | null>(null);

  const [score, setScore] = useState<ScoreOut | null>(null);
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [loans, setLoans] = useState<LoanOutcomeOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [umkmProfile, latestScore, transactions, loanList] =
        await Promise.all([
          apiFetch<UMKMProfileOut>("/umkm-profiles/me").catch(() => null),
          apiFetch<ScoreOut>("/scores/me/latest").catch(() => null),
          apiFetch<QrisTransactionOut[]>(
            "/qris-transactions/me?limit=1000",
          ).catch(() => [] as QrisTransactionOut[]),
          apiFetch<LoanOutcomeOut[]>("/loans/by-borrower/me").catch(
            () => [] as LoanOutcomeOut[],
          ),
        ]);

      setProfile(umkmProfile);
      setProfileExists(umkmProfile !== null);
      setForm(toForm(umkmProfile));
      setScore(latestScore);
      setTransactionCount(transactions.length);
      setLoans(loanList);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Profil dibuat lewat POST kalau belum ada, selebihnya PATCH.
      const saved = await apiFetch<UMKMProfileOut>("/umkm-profiles/me", {
        method: profileExists ? "PATCH" : "POST",
        body: JSON.stringify(toPayload(form)),
      });

      setProfile(saved);
      setProfileExists(true);
      setForm(toForm(saved));
      setEditing(false);
      setMessage({ tone: "ok", text: "Profil usaha berhasil disimpan." });
    } catch {
      setMessage({
        tone: "error",
        text: "Profil gagal disimpan. Silakan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  }

  const displayScore = score ? Math.round(score.acs_score) : null;
  const activeLoans = loans.filter((l) => l.status === "active").length;
  const initial = (
    profile?.business_name ??
    user?.full_name ??
    "Q"
  ).charAt(0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Identitas Akun */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold uppercase text-primary">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-foreground">
              {profile?.business_name ?? user?.full_name ?? "Pengguna"}
            </h1>
            <p className="truncate text-sm text-muted">{user?.email ?? "-"}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {user?.role ?? "umkm"}
          </span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted">
            {user?.is_active ? "Akun Aktif" : "Nonaktif"}
          </span>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/myqredi/score"
          className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm transition-colors hover:border-primary/30"
        >
          <p className="text-2xl font-bold text-foreground">
            {displayScore ?? "-"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted">
            {displayScore != null ? getRiskCategory(displayScore) : "Skor"}
          </p>
        </Link>

        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-foreground">
            {transactionCount?.toLocaleString("id-ID") ?? "-"}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-muted">Transaksi</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-foreground">{activeLoans}</p>
          <p className="mt-0.5 text-[11px] font-medium text-muted">
            Pinjaman Aktif
          </p>
        </div>
      </div>

      {/* Profil Usaha */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Storefront size={18} weight="fill" className="text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Profil Usaha
            </h2>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMessage(null);
              }}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <PencilSimple size={14} weight="bold" />
              Ubah
            </button>
          )}
        </div>

        {message && (
          <p
            className={`mt-3 rounded-xl px-3 py-2 text-sm ${
              message.tone === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </p>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="mt-4 space-y-3">
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1">
                <label
                  htmlFor={field.key}
                  className="text-xs font-medium text-muted"
                >
                  {field.label}
                </label>
                <input
                  id={field.key}
                  inputMode={
                    field.key === "monthly_revenue" ||
                    field.key === "years_operating" ||
                    field.key === "employee_count"
                      ? "numeric"
                      : "text"
                  }
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-surface transition-all hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50"
              >
                <Check size={16} weight="bold" />
                {saving ? "Menyimpan..." : "Simpan"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(toForm(profile));
                  setEditing(false);
                  setMessage(null);
                }}
                className="flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-3 text-sm font-semibold text-muted transition-colors hover:text-foreground"
              >
                <X size={16} weight="bold" />
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 divide-y divide-border/60">
            {FIELDS.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="text-sm text-muted">{field.label}</span>
                <span className="truncate text-sm font-semibold text-foreground">
                  {displayValue(field.key, form, field.suffix)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Riwayat Pinjaman */}
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Receipt size={18} weight="fill" className="text-primary" />
          <h2 className="text-base font-bold text-foreground">
            Riwayat Pinjaman
          </h2>
        </div>

        {loans.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Belum ada riwayat pinjaman. Ajukan pembiayaan untuk mulai membangun
            rekam jejak kredit Anda.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-border/60">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {formatRupiah(loan.loan_amount)}
                  </p>
                  <p className="text-xs text-muted">
                    {loan.loan_term_months} bulan &middot; jatuh tempo{" "}
                    {new Date(loan.due_date).toLocaleDateString("id-ID")}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                    loan.status === "paid"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : loan.status === "active"
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {loan.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tautan Cepat */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <Link
          href="/myqredi/financing"
          className="flex items-center justify-between gap-3 border-b border-border/60 p-4 transition-colors hover:bg-background"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <Buildings size={18} className="text-muted" />
            Rekomendasi Pembiayaan
          </span>
          <CaretRight size={16} className="text-muted" />
        </Link>

        <Link
          href="/myqredi/score/detail"
          className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-background"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <ArrowRight size={18} className="text-muted" />
            Detail Skor Qredi
          </span>
          <CaretRight size={16} className="text-muted" />
        </Link>
      </section>

      {/* Keluar */}
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50"
      >
        <SignOut size={18} weight="bold" />
        Keluar
      </button>
    </div>
  );
}

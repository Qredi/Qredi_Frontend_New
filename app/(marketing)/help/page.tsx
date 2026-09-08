"use client";

import Link from "next/link";
import { ArrowLeft, EnvelopeSimple, Headset, Question } from "@phosphor-icons/react";

export default function HelpPage() {
  return (
    <div className="bg-surface px-6 pt-28 pb-20 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        {/* Help Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Question size={44} weight="bold" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Pusat Bantuan
        </h1>

        {/* Description */}
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Halaman bantuan sedang dalam pengembangan. Jika Anda memiliki pertanyaan
          seputar layanan Qredi, penilaian kredit (ACS), atau pembiayaan UMKM,
          kami siap membantu Anda.
        </p>

        {/* Action Button: Back to Landing Page */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="
              inline-flex items-center gap-2
              rounded-full bg-primary
              px-8 py-4
              text-base font-semibold text-white
              transition-all duration-200
              hover:bg-foreground hover:shadow-md
            "
          >
            <ArrowLeft size={20} weight="bold" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>

        {/* Contact Info Cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-primary mb-4">
              <EnvelopeSimple size={24} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Email Dukungan</h2>
            <p className="mt-1 text-sm text-muted">
              Hubungi tim kami untuk pertanyaan teknis atau kemitraan.
            </p>
            <a
              href="mailto:support@qredi.id"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              support@qredi.id
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-primary mb-4">
              <Headset size={24} weight="bold" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Layanan Pengguna</h2>
            <p className="mt-1 text-sm text-muted">
              Senin - Jumat, pukul 09.00 - 17.00 WIB.
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">
              +62 (021) 555 - Qredi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

import { MyQrediLogo } from "@/components/branding/MyQrediLogo";
import { QrediDashboardLogo } from "@/components/branding/QrediDashboardLogo";

export default function Product() {
  return (
    <section id="produk" className="bg-surface px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Produk
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Solusi untuk Setiap Sisi Ekosistem Kredit
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Qredi menghadirkan solusi untuk membantu UMKM dan lembaga keuangan
            terhubung melalui data dan teknologi.
          </p>
        </div>

        {/* Products */}
        <div className="flex flex-col gap-8">
          {/* Qredi Dashboard */}
          <div className="grid overflow-hidden rounded-[2rem] bg-[#f2f5f8] lg:grid-cols-2">
            {/* Image */}
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] lg:min-h-[500px]">
              <Image
                src="/images/product-lender.png"
                alt="Qredi Dashboard untuk lender"
                fill
                className="object-cover hover:scale-105 transition-all duration-400"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
              <QrediDashboardLogo className="h-15 w-auto max-w-fit text-foreground" />

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/80">
                Platform bagi lender dan institusi keuangan untuk mendapatkan
                insight risiko kredit berbasis alternative credit scoring.
              </p>

              <ul className="mt-6 space-y-3 text-base text-foreground/80">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Credit score berbasis data alternatif</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Monitoring dan analisis portofolio</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Insight untuk mendukung proses analisis kredit</span>
                </li>
              </ul>

              <div className="mt-8">
                <Link
                  href="#"
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    bg-foreground
                    px-6 py-3
                    text-base font-medium text-white
                    transition-colors duration-200
                    hover:bg-primary
                  "
                >
                  Masuk ke Qredi Dashboard
                  <ArrowRight size={17} weight="bold" />
                </Link>
              </div>
            </div>
          </div>

          {/* MyQredi */}
          <div className="grid overflow-hidden rounded-[2rem] bg-[#f2f5f8] lg:grid-cols-2">
            {/* Content */}
            <div className="order-2 flex flex-col justify-center px-8 py-12 sm:px-12 lg:order-1 lg:px-16">
              <MyQrediLogo className="h-15 w-auto max-w-fit text-foreground" />

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/80">
                Platform yang membantu UMKM memahami dan membangun profil kredit
                mereka dengan memanfaatkan data transaksi yang relevan.
              </p>

              <ul className="mt-6 space-y-3 text-base text-foreground/80">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Profil kredit yang lebih mudah dipahami</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Memanfaatkan data transaksi secara relevan</span>
                </li>

                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>Membantu meningkatkan kesiapan akses kredit</span>
                </li>
              </ul>

              <div className="mt-8">
                <Link
                  href="#"
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    bg-foreground
                    px-6 py-3
                    text-base font-medium text-white
                    transition-colors duration-200
                    hover:bg-primary
                  "
                >
                  Masuk ke MyQredi
                  <ArrowRight size={17} weight="bold" />
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="order-1 relative min-h-[360px] overflow-hidden rounded-[1.5rem] lg:order-2 lg:min-h-[500px]">
              <Image
                src="/images/product-umkm.png"
                alt="MyQredi untuk UMKM"
                fill
                className="object-cover hover:scale-105 duration-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

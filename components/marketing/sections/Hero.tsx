"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-4 lg:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Memberdayakan UMKM dengan Cara yang Lebih
              <span className="text-primary font-bold"> Inovatif.</span>
            </h1>

            <p className="mt-6 max-w-xl text-xl leading-relaxed text-muted">
              Menghubungkan teknologi AI dan data alternatif untuk membuka akses
              keuangan yang lebih inklusif bagi UMKM.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#produk"
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-primary
                  px-6 py-3
                  text-base font-medium text-white
                  transition-colors duration-200
                  hover:bg-foreground/90
                "
              >
                Pelajari Qredi
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex items-center justify-center lg:justify-end">
            <Image
              src="/images/UMKM-hero.png"
              alt="Ilustrasi UMKM menggunakan layanan Qredi"
              width={700}
              height={600}
              priority
              className="
                h-auto
                w-full
                max-w-120
                object-contain
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}

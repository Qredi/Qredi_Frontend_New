"use client";

import { CaretDown } from "@phosphor-icons/react";

export default function Home() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Outline Brand */}
      <img
        src="/images/outline-brand.png"
        alt=""
        className="pointer-events-none absolute -bottom-24 right-0 z-1 w-80 md:w-md lg:w-xl"
      />

      {/* Content */}
      <div className="relative z-10 mt-8 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-1 md:px-2">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Memberdayakan UMKM dengan Cara yang Lebih Inovatif.
            </h1>

            <button
              type="button"
              className="
                mt-8
                inline-flex cursor-pointer items-center gap-3
                rounded-full
                border border-white
                px-6 py-3
                text-base font-medium text-white/90
                transition-all duration-300
                hover:text-white
              "
            >
              <span>Lihat Selengkapnya</span>
              <CaretDown size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

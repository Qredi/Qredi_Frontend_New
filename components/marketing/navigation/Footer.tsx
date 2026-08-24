"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { QrediLogo } from "@/components/branding/QrediLogo";

const navItems = [
  { label: "Produk", href: "#produk" },
  { label: "Solusi", href: "#solusi" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Tentang Kami", href: "#tentang-kami" },
];

export default function Footer() {
  return (
    <footer className="bg-primary-foreground px-6 py-14 text-white md:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Main Footer */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="Qredi">
              <QrediLogo className="h-12 text-white" />
            </Link>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-white/70">
              Memperluas akses pembiayaan UMKM melalui data dan teknologi AI
              untuk penilaian kredit yang lebih inklusif.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/40">
              Navigasi
            </p>

            <nav className="mt-5 flex flex-col items-start gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    text-base text-white/80
                    transition-colors duration-200
                    hover:text-white
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Products */}
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-white/40">
              Platform
            </p>

            <div className="mt-5 flex flex-col items-start gap-3">
              <Link
                href="#"
                className="
                  group inline-flex items-center gap-2
                  text-base text-white/80
                  transition-colors duration-200
                  hover:text-white
                "
              >
                MyQredi
                <ArrowUpRight
                  size={16}
                  weight="regular"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <Link
                href="#"
                className="
                  group inline-flex items-center gap-2
                  text-base text-white/70
                  transition-colors duration-200
                  hover:text-white
                "
              >
                Qredi Dashboard
                <ArrowUpRight
                  size={16}
                  weight="regular"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Qredi. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <Link href="#" className="transition-colors hover:text-white">
                Kebijakan Privasi
              </Link>

              <Link href="#" className="transition-colors hover:text-white">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

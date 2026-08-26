"use client";

import Link from "next/link";
import { CaretDown, CaretRight, User } from "@phosphor-icons/react";

import { MyQrediLogo } from "@/components/branding/MyQrediLogo";
import { QrediDashboardLogo } from "@/components/branding/QrediDashboardLogo";

interface LoginMenuProps {
  defaultMode: boolean;
}

const loginItems = [
  {
    description: "Platform untuk lender dan institusi keuangan.",
    href: "/dashboard",
    logo: QrediDashboardLogo,
  },
  {
    description: "Platform untuk UMKM mengelola profil kredit.",
    href: "/myqredi/score",
    logo: MyQrediLogo,
  },
];

export function LoginMenu({ defaultMode }: LoginMenuProps) {
  return (
    <div className="group relative">
      {/* Trigger */}
      <button
        type="button"
        className="
          flex cursor-pointer items-center gap-2
          rounded-full bg-primary
          px-6 py-3
          text-lg font-medium text-white
          transition-colors duration-300
          hover:bg-primary-foreground
        "
      >
        <User size={18} weight="bold" />

        <span>Masuk</span>

        <CaretDown
          size={14}
          weight="bold"
          className="transition-transform duration-200 group-hover:rotate-180"
        />
      </button>

      {/* Dropdown */}
      <div
        className="
          invisible absolute right-0 top-full z-50
          w-90 pt-3
          translate-y-1 opacity-0
          transition-all duration-200
          group-hover:visible
          group-hover:translate-y-0
          group-hover:opacity-100
        "
      >
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          {loginItems.map((item) => {
            const Logo = item.logo;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="
                  group/item
                  flex items-center gap-4
                  rounded-sm
                  px-4 py-4
                  transition-colors duration-200
                  hover:bg-slate-100
                "
              >
                {/* Logo + Description */}
                <div className="min-w-0 flex-1">
                  <Logo className="h-9 w-auto text-foreground" />

                  <p className="mt-1 text-sm ml-8 leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>

                {/* Caret Right */}
                <CaretRight
                  size={20}
                  weight="regular"
                  className="
                    shrink-0 text-muted
                    transition-all duration-200
                    group-hover/item:translate-x-1
                    group-hover/item:text-foreground
                  "
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

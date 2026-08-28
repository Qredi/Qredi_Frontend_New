"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Speedometer, Briefcase, User } from "@phosphor-icons/react";

export default function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      label: "Skor Saya",
      href: "/myqredi/score",
      icon: Speedometer,
      isActive: pathname.startsWith("/myqredi/score"),
    },
    {
      label: "Pembiayaan",
      href: "/myqredi/financing",
      icon: Briefcase,
      isActive: pathname.startsWith("/myqredi/financing"),
    },
    {
      label: "Profil",
      href: "/myqredi/profile",
      icon: User,
      isActive: pathname.startsWith("/myqredi/profile"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-16 pointer-events-none">
      <div className="mx-auto h-full w-full max-w-md border-t border-border bg-surface shadow-lg pointer-events-auto">
        <div className="flex h-full items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-colors ${
                  item.isActive
                    ? "font-semibold text-primary"
                    : "font-medium text-muted/80 hover:text-foreground"
                }`}
              >
                <Icon
                  size={24}
                  weight={item.isActive ? "fill" : "regular"}
                  className="mb-0.5"
                />

                <span className="text-xs tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

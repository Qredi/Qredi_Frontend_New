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
      // Active jika berada di /myqredi/score atau sub-halaman detail skor
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 w-full border-t border-border bg-surface shadow-lg">
      <div className="mx-auto flex h-full max-w-md items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center py-1.5 transition-colors ${
                item.isActive
                  ? "text-primary font-semibold"
                  : "text-muted/80 hover:text-foreground font-medium"
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
    </nav>
  );
}

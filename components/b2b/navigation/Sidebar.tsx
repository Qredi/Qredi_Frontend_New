"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  ClipboardText,
  Warning,
  Brain,
  Gear,
  Question,
} from "@phosphor-icons/react";

const mainNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: SquaresFour,
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: ClipboardText,
  },
  {
    label: "Risk Monitoring",
    href: "/dashboard/risk-monitoring",
    icon: Warning,
  },
  {
    label: "Model Insights",
    href: "/dashboard/model-insights",
    icon: Brain,
  },
];

const secondaryNavItems = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Gear,
  },
  {
    label: "Help",
    href: "/dashboard/help",
    icon: Question,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const renderNavItem = (item: (typeof mainNavItems)[number]) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          group flex w-full items-center gap-3
          rounded-md px-4 py-3
          text-base font-medium
          transition-colors duration-200
          ${
            active
              ? "bg-primary/5 text-primary"
              : "text-muted hover:bg-slate-50 hover:text-primary"
          }
        `}
      >
        <Icon
          size={23}
          weight={active ? "fill" : "regular"}
          className="shrink-0 transition-colors duration-200"
        />

        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="fixed inset-x-0 bottom-0 left-0 top-16 z-40 flex w-64 flex-col bg-surface">
      <nav className="flex flex-1 flex-col p-4">
        {/* Main Navigation */}
        <div className="flex flex-col gap-1">
          {mainNavItems.map((item) => renderNavItem(item))}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Secondary Navigation */}
        <div className="flex flex-col gap-1">
          {secondaryNavItems.map((item) => renderNavItem(item))}
        </div>
      </nav>
    </aside>
  );
}

"use client";

import { User } from "@phosphor-icons/react";
import { QrediDashboardLogo } from "@/components/branding/QrediDashboardLogo";

export default function Topbar() {
  return (
    <header
      className="
    fixed inset-x-0 top-0 z-50
    flex h-16 w-full items-center justify-between
    border-b border-border
    bg-surface
  "
    >
      {/* Logo */}
      <div className="flex h-full items-center px-6">
        <QrediDashboardLogo className="h-11 w-auto text-foreground" />
      </div>

      {/* Profile */}
      <button
        type="button"
        className="
          flex h-full items-center gap-3
          px-6 mr-8
          text-left
          transition-colors duration-200
          hover:bg-slate-100
          cursor-pointer
        "
      >
        {/* Profile Picture */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-400">
          <User size={21} weight="regular" className="text-white" />
        </div>

        {/* Account Info */}
        <div className="flex flex-col">
          <span className="text-base font-medium leading-tight text-foreground">
            Demo Account
          </span>

          <span className="mt-1 text-xs leading-tight text-muted">Admin</span>
        </div>
      </button>
    </header>
  );
}

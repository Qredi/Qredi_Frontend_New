"use client";

import Link from "next/link";
import { Bell, Question } from "@phosphor-icons/react";
import { MyQrediLogo } from "@/components/branding/MyQrediLogo";

interface TopbarProps {
  hasUnreadNotification?: boolean;
}

export default function Topbar({ hasUnreadNotification = true }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4">
      {/* Brand Logo */}
      <Link href="/myqredi/score" className="flex items-center gap-2">
        <MyQrediLogo className="h-9 text-foreground" />
      </Link>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Help Button */}
        <Link
          href="/myqredi/help"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-slate-100 hover:text-foreground transition-colors"
          aria-label="Bantuan"
        >
          <Question size={22} />
        </Link>

        {/* Notification Button */}
        <Link
          href="/myqredi/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-slate-100 hover:text-foreground transition-colors"
          aria-label="Notifikasi"
        >
          <Bell size={22} />
          {hasUnreadNotification && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface" />
          )}
        </Link>
      </div>
    </header>
  );
}

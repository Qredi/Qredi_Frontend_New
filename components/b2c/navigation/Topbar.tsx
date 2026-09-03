"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-16 shrink-0
        items-center justify-between
        border-b border-border
        bg-surface
        px-4
      "
    >
      <div className="w-8" />

      {/* Profile Info */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium leading-tight text-foreground">
            {user?.full_name ?? "Loading..."}
          </span>
          <span className="mt-0.5 text-xs leading-tight text-muted capitalize">
            {user?.role ?? ""}
          </span>
        </div>
      </div>
    </header>
  );
}

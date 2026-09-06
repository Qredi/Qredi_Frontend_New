"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/types";

interface RequireAuthProps {
  loginPath: string;
  /** Role yang boleh membuka area ini. Kosong = semua role yang sudah login. */
  allow?: UserRole[];
  children: React.ReactNode;
}

/**
 * Arahkan pengunjung yang belum login (atau salah role) ke halaman login.
 *
 * Anak komponen tetap dirender supaya markup server dan client identik —
 * pengalihan dilakukan lewat effect, bukan dengan menahan render.
 */
export default function RequireAuth({
  loginPath,
  allow,
  children,
}: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(loginPath);
      return;
    }

    if (allow && !allow.includes(user.role)) {
      router.replace(user.role === "umkm" ? "/myqredi/score" : "/dashboard");
    }
  }, [isLoading, user, allow, loginPath, router]);

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/types";

interface RequireAuthProps {
  loginPath: string;
  /** Role yang boleh membuka area ini. Kosong = semua role yang sudah login. */
  allow?: UserRole[];
  children: React.ReactNode;
}

export default function RequireAuth({
  loginPath,
  allow,
  children,
}: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (!user) {
      router.replace(loginPath);
      return;
    }

    if (allow && !allow.includes(user.role)) {
      router.replace(user.role === "umkm" ? "/myqredi/score" : "/dashboard");
    }
  }, [isLoading, mounted, user, allow, loginPath, router]);

  
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  // Jika tidak ada user atau role tidak diizinkan, jangan render anak komponen
  if (!user || (allow && !allow.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}

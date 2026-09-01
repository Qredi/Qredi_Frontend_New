"use client";

import Link from "next/link";
import { ArrowLeft, SignIn } from "@phosphor-icons/react";
import { QrediDashboardLogo } from "@/components/branding/QrediDashboardLogo";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" aria-label="Qredi Dashboard">
            <QrediDashboardLogo className="h-10 w-auto text-foreground" />
          </Link>
        </div>

        {/* Heading */}
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sign In
          </h1>

          <p className="mt-2 text-base text-muted">Masuk ke Qredi Dashboard</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-5">
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="Masukkan email"
            autoComplete="email"
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Masukkan password"
            autoComplete="current-password"
          />

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="#"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Lupa password?
            </Link>
          </div>

          {/* Login Button */}
          <Button type="submit" variant="primary" className="w-full">
            Masuk ke Dashboard
          </Button>
        </form>
      </div>
    </main>
  );
}

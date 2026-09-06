"use client";

import Link from "next/link";
import { useState } from "react";
import { QrediDashboardLogo } from "@/components/branding/QrediDashboardLogo";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  }

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
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <InputField
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="Masukkan email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

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
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Masuk..." : "Masuk ke Dashboard"}
          </Button>
        </form>
      </div>
    </main>
  );
}

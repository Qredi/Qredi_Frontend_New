"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { MyQrediLogo } from "@/components/branding/MyQrediLogo";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { ApiError } from "@/lib/api";

export default function MyQrediLoginPage() {
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
    <div className="min-h-screen bg-gray-100 text-foreground flex justify-center">
      <div className="relative flex w-full max-w-md flex-col min-h-screen bg-surface">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
          <Link
            href="/"
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center text-muted transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>

          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Masuk MyQredi
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Logo */}
          <div className="mb-8">
            <MyQrediLogo className="h-10 w-auto text-foreground" />
          </div>

          {/* Form */}
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Masuk..." : "Masuk"}
            </Button>
          </form>
        </main>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Sun, Info } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/client-api";

export default function MasukPage() {
  return (
    <Suspense>
      <MasukForm />
    </Suspense>
  );
}

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.push(next.startsWith("/") ? next : "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      {/* Side panel */}
      <aside className="hidden flex-col justify-between overflow-hidden rounded-[2rem] bg-secondary p-10 text-white lg:flex">
        <div>
          <Sun size={40} className="text-[#FFD9A0]" fill="currentColor" aria-hidden />
          <h1 className="mt-6 font-heading text-3xl font-extrabold leading-snug">Selamat datang kembali,<br />Ayah & Bunda! 👋</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
            Lanjutkan perjalanan parenting Anda: lacak milestone, simpan artikel favorit, dan kumpulkan badge.
          </p>
        </div>
        <ul className="mt-8 space-y-3 text-sm text-white/80">
          <li className="flex items-center gap-2">✓ Streak & poin harian otomatis tercatat</li>
          <li className="flex items-center gap-2">✓ Progress Learning Path tersimpan</li>
          <li className="flex items-center gap-2">✓ Bookmark tersinkron di semua perangkat</li>
        </ul>
      </aside>

      {/* Form */}
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-heading text-2xl font-extrabold text-secondary">Masuk ke Akun</h2>
        <p className="mt-1 text-sm text-muted">Belum punya akun? <Link href="/daftar" className="font-bold text-primary hover:underline">Daftar gratis</Link></p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="namaanda@email.com"
              className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Password</label>
              <Link href="/lupa-password" className="text-[11px] font-bold text-secondary hover:underline">Lupa password?</Link>
            </div>
            <div className="relative mt-1.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-sand bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white transition hover:bg-primary-deep disabled:opacity-60"
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} aria-hidden />}
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-accent/30 bg-accent-soft/50 px-4 py-3 text-[11px] leading-5 text-accent-deep">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span><strong>Akun demo:</strong> demo@mentari.id · password <code className="rounded bg-white/70 px-1">mentari123</code> (atau admin@mentari.id untuk Admin CMS)</span>
        </div>
      </div>
    </div>
  );
}

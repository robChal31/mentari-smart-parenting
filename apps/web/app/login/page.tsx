"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn, Sun, Info } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useDictionary } from "@/components/i18n-provider";
import { ApiError } from "@/lib/client-api";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const { login } = useAuth();
  const dict = useDictionary();

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
      setError(err instanceof ApiError ? err.message : dict.auth.loginFailed);
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
          <h1 className="mt-6 font-heading text-3xl font-extrabold leading-snug">{dict.auth.loginSideTitleA}<br />{dict.auth.loginSideTitleB}</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">{dict.auth.loginSideSub}</p>
        </div>
        <ul className="mt-8 space-y-3 text-sm text-white/80">
          {dict.auth.loginSidePoints.map((point) => (
            <li key={point} className="flex items-center gap-2">✓ {point}</li>
          ))}
        </ul>
      </aside>

      {/* Form */}
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-heading text-2xl font-extrabold text-secondary">{dict.auth.loginTitle}</h2>
        <p className="mt-1 text-sm text-muted">{dict.auth.loginNoAccount} <Link href="/register" className="font-bold text-primary hover:underline">{dict.auth.loginRegisterLink}</Link></p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.auth.email}</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.auth.emailPlaceholder}
              className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.auth.password}</label>
              <Link href="/forgot-password" className="text-[11px] font-bold text-secondary hover:underline">{dict.auth.forgotPassword}</Link>
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
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? dict.auth.hidePassword : dict.auth.showPassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
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
            {busy ? dict.auth.loginBusy : dict.auth.loginSubmit}
          </button>
        </form>

        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-accent/30 bg-accent-soft/50 px-4 py-3 text-[11px] leading-5 text-accent-deep">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>
            <strong>{dict.auth.demoNoteTitle}</strong>{dict.auth.demoNoteBody}<code className="rounded bg-white/70 px-1">mentari123</code>{dict.auth.demoNoteAdmin}
          </span>
        </div>
      </div>
    </div>
  );
}

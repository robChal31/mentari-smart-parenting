"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Rocket, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useDictionary } from "@/components/i18n-provider";
import { ApiError } from "@/lib/client-api";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const dict = useDictionary();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      setError(dict.auth.passwordMinError);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      router.push("/profile?welcome=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.auth.registerFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      <aside className="hidden flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[#FF8E53] p-10 text-white lg:flex">
        <div>
          <Sparkles size={36} className="text-[#FFE27A]" aria-hidden />
          <h1 className="mt-6 font-heading text-3xl font-extrabold leading-snug">{dict.auth.registerSideTitleA}<br />{dict.auth.registerSideTitleB}</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">{dict.auth.registerSideSub}</p>
        </div>
        <ul className="mt-8 space-y-3 text-sm text-white/90">
          {dict.auth.registerSidePoints.map((point) => (
            <li key={point} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#FFE27A]" aria-hidden />{point}</li>
          ))}
        </ul>
      </aside>

      <div className="mx-auto w-full max-w-md">
        <h2 className="font-heading text-2xl font-extrabold text-secondary">{dict.auth.registerTitle}</h2>
        <p className="mt-1 text-sm text-muted">{dict.auth.registerHaveAccount} <Link href="/login" className="font-bold text-primary hover:underline">{dict.auth.registerLoginLink}</Link></p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
          )}
          <div>
            <label htmlFor="fullName" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.auth.nameLabel}</label>
            <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" placeholder="Ratna Sari" className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <div>
            <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.auth.email}</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder={dict.auth.emailPlaceholder} className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <div>
            <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.auth.password} <span className="normal-case text-muted/70">{dict.auth.passwordMin}</span></label>
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
            <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#FF6B35]" />
            <span>
              {dict.auth.agreePrefix} <Link href="/terms" className="font-bold text-secondary hover:underline">{dict.auth.agreeTerms}</Link> {dict.auth.agreeAnd} <Link href="/privacy" className="font-bold text-secondary hover:underline">{dict.auth.agreePrivacy}</Link>{dict.auth.agreeSuffix ? ` ${dict.auth.agreeSuffix}` : ""}
            </span>
          </label>
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white transition hover:bg-primary-deep disabled:opacity-60">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} aria-hidden />}
            {busy ? dict.auth.registerBusy : dict.auth.registerSubmit}
          </button>
        </form>
        <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted"><Rocket size={11} aria-hidden /> {dict.auth.badgeWaiting}</p>
      </div>
    </div>
  );
}

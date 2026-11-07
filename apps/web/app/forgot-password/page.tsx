"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailQuestion } from "lucide-react";
import { apiData, ApiError } from "@/lib/client-api";
import { useDictionary } from "@/components/i18n-provider";
import { format } from "@/lib/i18n/format";

export default function ForgotPasswordPage() {
  const dict = useDictionary();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiData("/auth/forgot-password", { body: { email: email.trim() }, auth: false });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.auth.forgotFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      {sent ? (
        <div className="rounded-3xl border border-accent/30 bg-accent-soft/50 p-8 text-center">
          <CheckCircle2 size={44} className="mx-auto text-accent-deep" aria-hidden />
          <h1 className="mt-4 font-heading text-xl font-extrabold text-secondary">{dict.auth.sentTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{format(dict.auth.sentBody, { email })}</p>
          <Link href="/login" className="mt-6 inline-block rounded-2xl bg-secondary px-6 py-3 text-sm font-bold text-white hover:bg-secondary-deep">{dict.auth.backToLogin}</Link>
        </div>
      ) : (
        <>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary-soft text-secondary"><MailQuestion size={26} aria-hidden /></span>
          <h1 className="mt-5 font-heading text-2xl font-extrabold text-secondary">{dict.auth.forgotTitle}</h1>
          <p className="mt-1 text-sm text-muted">{dict.auth.forgotSub}</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div>
              <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">{dict.auth.email}</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder={dict.auth.emailPlaceholder} className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-primary-deep disabled:opacity-60">
              {busy ? <Loader2 size={17} className="animate-spin" /> : null}
              {busy ? dict.auth.forgotBusy : dict.auth.forgotSubmit}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

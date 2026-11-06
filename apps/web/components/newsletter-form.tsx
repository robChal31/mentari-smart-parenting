"use client";

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-deep">
        <MailCheck size={18} aria-hidden /> Terima kasih! Tips minggu ini akan tiba di inbox Anda.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes("@")) return;
        setDone(true);
      }}
      className={`flex ${compact ? "flex-col gap-2 sm:flex-row" : "flex-col gap-2"}`}
    >
      <label className="sr-only" htmlFor={compact ? "nl-footer" : "nl-block"}>Email Anda</label>
      <input
        id={compact ? "nl-footer" : "nl-block"}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="namaanda@email.com"
        className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-accent focus:bg-white/15"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-secondary-deep transition hover:bg-accent-deep hover:text-white"
      >
        <Send size={16} aria-hidden /> Langganan
      </button>
    </form>
  );
}

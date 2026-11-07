"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Rocket, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/client-api";

export default function DaftarPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      router.push("/profil?selamat-datang=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat akun. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      <aside className="hidden flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[#FF8E53] p-10 text-white lg:flex">
        <div>
          <Sparkles size={36} className="text-[#FFE27A]" aria-hidden />
          <h1 className="mt-6 font-heading text-3xl font-extrabold leading-snug">Bergabung dengan<br />100.000+ Orang Tua Indonesia</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/85">
            Gratis selamanya. Dapatkan konten ahli, lacak tumbuh kembang anak, dan kumpulkan badge setiap minggu.
          </p>
        </div>
        <ul className="mt-8 space-y-3 text-sm text-white/90">
          {["Profil anak tak terbatas untuk setiap balita Anda", "Rekomendasi konten & produk yang personal", "Badge & streak — parenting jadi lebih seru"].map((item) => (
            <li key={item} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#FFE27A]" aria-hidden />{item}</li>
          ))}
        </ul>
      </aside>

      <div className="mx-auto w-full max-w-md">
        <h2 className="font-heading text-2xl font-extrabold text-secondary">Buat Akun Gratis</h2>
        <p className="mt-1 text-sm text-muted">Sudah punya akun? <Link href="/masuk" className="font-bold text-primary hover:underline">Masuk di sini</Link></p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
          )}
          <div>
            <label htmlFor="fullName" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Nama Lengkap</label>
            <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" placeholder="Ratna Sari, S.Psi." className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <div>
            <label htmlFor="email" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="namaanda@email.com" className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <div>
            <label htmlFor="password" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Password <span className="normal-case text-muted/70">(min. 6 karakter)</span></label>
            <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" className="mt-1.5 w-full rounded-2xl border border-sand bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </div>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted">
            <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#FF6B35]" />
            <span>Saya setuju dengan <Link href="/syarat-ketentuan" className="font-bold text-secondary hover:underline">Syarat & Ketentuan</Link> dan <Link href="/kebijakan-privasi" className="font-bold text-secondary hover:underline">Kebijakan Privasi</Link> MentariSmartParent.</span>
          </label>
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white transition hover:bg-primary-deep disabled:opacity-60">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} aria-hidden />}
            {busy ? "Membuat akun…" : "Daftar Sekarang"}
          </button>
        </form>
        <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted"><Rocket size={11} aria-hidden /> Badge “Langkah Pertama” menunggu Anda</p>
      </div>
    </div>
  );
}

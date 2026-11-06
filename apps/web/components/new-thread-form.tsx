"use client";

import { useState } from "react";
import { Loader2, MessagesSquare, Send } from "lucide-react";
import { apiData, ApiError } from "@/lib/client-api";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { slug: "nutrisi", label: "Nutrisi & MPASI" },
  { slug: "tidur", label: "Tidur & Rutinitas" },
  { slug: "tantrum", label: "Tantrum & Disiplin" },
  { slug: "sekolah", label: "Sekolah & Belajar" },
  { slug: "kesehatan", label: "Kesehatan" },
  { slug: "lainnya", label: "Lainnya" },
];

export function NewThreadForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState("lainnya");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-sand bg-white/70 p-5 text-center text-sm text-muted">
        <MessagesSquare size={22} className="mx-auto mb-2 text-secondary/50" aria-hidden />
        <p><a href="/masuk?next=/komunitas" className="font-bold text-primary hover:underline">Masuk</a> untuk ikut berdiskusi dengan ribuan orang tua lainnya.</p>
      </div>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const thread = await apiData<{ id: string }>("/community/threads", {
        body: { title: title.trim(), body: body.trim(), categorySlug },
      });
      setOpen(false);
      setTitle("");
      setBody("");
      router.push(`/komunitas/${thread.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat thread.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-heading text-sm font-bold text-white transition hover:bg-primary-deep">
        <MessagesSquare size={16} aria-hidden /> Tulis Diskusi Baru
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="w-full rounded-3xl border border-sand bg-white p-5 shadow-sm">
      {error && <p role="alert" className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
      <label htmlFor="thread-title" className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Judul diskusi</label>
      <input id="thread-title" required minLength={8} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Anak 2 tahun susah makan sayur — ada yang sama?" className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-3 text-sm outline-none focus:border-primary" />
      <label htmlFor="thread-body" className="mt-4 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">Isi</label>
      <textarea id="thread-body" required minLength={20} rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ceritakan konteksnya — usia anak, sudah coba apa, dsb." className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-3 text-sm outline-none focus:border-primary" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} aria-label="Kategori diskusi" className="rounded-2xl border border-sand bg-cream px-4 py-3 text-sm outline-none focus:border-primary">
          {CATEGORIES.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.label}</option>)}
        </select>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-sand px-4 py-3 text-sm font-bold text-muted hover:bg-cream">Batal</button>
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-white hover:bg-secondary-deep disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Kirim
          </button>
        </div>
      </div>
    </form>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cari Konten",
  description: "Cari ratusan konten parenting Mentari — artikel, video, tips dan aktivitas.",
  robots: { index: false, follow: true },
};

export default async function CariPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const raw = params.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  const result = q ? await api.search({ q, limit: "24" }) : { items: [], meta: null };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold text-secondary">Pencarian</h1>

      <form action="/cari" method="get" role="search" className="mt-5 max-w-2xl">
        <label className="flex items-center gap-3 rounded-3xl border-2 border-sand bg-white px-5 py-4 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search size={22} className="shrink-0 text-primary" aria-hidden />
          <input
            type="search"
            name="q"
            autoFocus
            defaultValue={q}
            placeholder="Ketik topik… mis. MPASI, tantrum, tidur"
            aria-label="Kata kunci pencarian"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted/60"
          />
          <button type="submit" className="shrink-0 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-deep">Cari</button>
        </label>
      </form>

      <div className="mt-8">
        {q ? (
          result.items.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted"><strong className="text-secondary">{result.meta?.total ?? result.items.length}</strong> hasil untuk “<strong className="text-secondary">{q}</strong>”</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {result.items.map((content) => <ContentCard key={content.id} content={content} />)}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-sand bg-white/60 px-6 py-14 text-center">
              <SearchX size={40} className="mx-auto text-muted/50" aria-hidden />
              <p className="mt-4 font-heading text-lg font-bold text-secondary">Tidak ada hasil untuk “{q}”</p>
              <p className="mt-1 text-sm text-muted">Coba kata kunci lain — misalnya “MPASI”, “tantrum”, atau “disiplin”.</p>
              <Link href="/contents" className="mt-5 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-deep">Jelajah Semua Konten</Link>
            </div>
          )
        ) : (
          <div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">Pencarian populer</p>
            <div className="flex flex-wrap gap-2">
              {["MPASI", "tantrum", "sleep training", "stimulasi motorik", "persiapan SD", "self-esteem", "screen time", "imunisasi"].map((term) => (
                <Link key={term} href={`/cari?q=${encodeURIComponent(term)}`} className="rounded-full border border-sand bg-white px-4 py-2 text-xs font-semibold text-secondary transition hover:border-primary hover:text-primary">
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

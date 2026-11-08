import Link from "next/link";
import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return {
    title: dict.searchPage.metaTitle,
    description: dict.searchPage.metaDescription,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { dict } = await getDictionary();
  const params = await searchParams;
  const raw = params.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";

  // Item permintaan: saat query kosong, tampilkan chip populer DAN konten
  // terbaru (sebelumnya halaman tampak "kosong" tanpa konten apa pun).
  const [result, latest] = q
    ? [await api.search({ q, limit: "24" }), null]
    : [{ items: [], meta: null }, await api.contents({ sort: "latest", limit: "8" })];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-extrabold text-secondary">{dict.searchPage.title}</h1>

      <form action="/search" method="get" role="search" className="mt-5 max-w-2xl">
        <label className="flex items-center gap-3 rounded-3xl border-2 border-sand bg-white px-5 py-4 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search size={22} className="shrink-0 text-primary" aria-hidden />
          <input
            type="search"
            name="q"
            autoFocus
            defaultValue={q}
            placeholder={dict.searchPage.placeholder}
            aria-label={dict.searchPage.inputAria}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted/60"
          />
          <button type="submit" className="shrink-0 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-deep">{dict.searchPage.submit}</button>
        </label>
      </form>

      <div className="mt-8">
        {q ? (
          result.items.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted">{format(dict.searchPage.countLabel, { count: result.meta?.total ?? result.items.length, q })}</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {result.items.map((content) => <ContentCard key={content.id} content={content} />)}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-sand bg-white/60 px-6 py-14 text-center">
              <SearchX size={40} className="mx-auto text-muted/50" aria-hidden />
              <p className="mt-4 font-heading text-lg font-bold text-secondary">{format(dict.searchPage.noResultsTitle, { q })}</p>
              <p className="mt-1 text-sm text-muted">{dict.searchPage.noResultsHint}</p>
              <Link href="/contents" className="mt-5 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-deep">{dict.searchPage.exploreAll}</Link>
            </div>
          )
        ) : (
          <>
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">{dict.searchPage.popularTitle}</p>
              <div className="flex flex-wrap gap-2">
                {dict.searchPage.popularTerms.map((term) => (
                  <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="rounded-full border border-sand bg-white px-4 py-2 text-xs font-semibold text-secondary transition hover:border-primary hover:text-primary">
                    {term}
                  </Link>
                ))}
              </div>
            </div>
            {latest && latest.items.length > 0 && (
              <div className="mt-10">
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">{dict.searchPage.latestTitle}</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {latest.items.map((content) => <ContentCard key={content.id} content={content} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

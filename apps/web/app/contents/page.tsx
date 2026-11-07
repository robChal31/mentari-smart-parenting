import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { CONTENT_TYPE_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jelajah Konten Parenting",
  description:
    "Artikel, video, infografis dan tips parenting berbasis bukti — filter berdasarkan usia anak, kategori, dan tipe konten.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const query = {
    q: get("q"),
    type: get("type"),
    category: get("category"),
    ageGroup: get("ageGroup"),
    tag: get("tag"),
    sort: get("sort") ?? "newest",
    page: get("page") ?? "1",
    limit: "12",
  };

  const [result, categories, ageGroups] = await Promise.all([
    api.contents(query),
    api.categories(),
    api.ageGroups(),
  ]);

  const { items, meta } = result;
  const flatCategories = (categories ?? []).flatMap((c) => [c, ...(c.children ?? [])]);
  const activeFilters = [query.q, query.type, query.category, query.ageGroup, query.tag].filter(Boolean).length;

  function pageHref(page: number): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value && key !== "page" && key !== "limit" && key !== "sort") search.set(key, String(value));
      else if (key === "sort" && value && value !== "newest") search.set(key, String(value));
    }
    search.set("page", String(page));
    return `/contents?${search.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Perpustakaan Mentari</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">Jelajah Konten Parenting</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {meta ? `${meta.total} konten ditemukan` : "Semua konten"} · dikurasi psikolog, dokter anak, dan pendidik Mentari.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* ===== Sidebar filter (GET form — works without JS) ===== */}
        <aside className="h-fit rounded-3xl border border-sand bg-white p-5 lg:sticky lg:top-24">
          <form action="/contents" method="get" className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 font-heading text-sm font-extrabold text-secondary">
                <SlidersHorizontal size={15} aria-hidden /> Filter
                {activeFilters > 0 && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{activeFilters}</span>
                )}
              </p>
              {activeFilters > 0 && <Link href="/contents" className="text-[11px] font-bold text-primary hover:underline">Atur ulang</Link>}
            </div>

            <input type="hidden" name="sort" value={query.sort} />

            <div>
              <label htmlFor="q" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Kata kunci</label>
              <input
                id="q"
                name="q"
                defaultValue={query.q}
                placeholder="mis. MPASI, tantrum…"
                className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none transition focus:border-primary"
              />
            </div>

            <fieldset>
              <legend className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Usia anak</legend>
              <div className="mt-1.5 space-y-1">
                {(ageGroups ?? []).map((group) => (
                  <label key={group.id} className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-ink/85 transition hover:bg-cream">
                    <input type="radio" name="ageGroup" value={group.slug} defaultChecked={query.ageGroup === group.slug} className="accent-[#FF6B35]" />
                    {group.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="type" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Tipe konten</label>
              <select id="type" name="type" defaultValue={query.type ?? ""} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="">Semua tipe</option>
                {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Kategori</label>
              <select id="category" name="category" defaultValue={query.category ?? ""} className="mt-1.5 w-full rounded-2xl border border-sand bg-cream px-4 py-2.5 text-sm outline-none focus:border-primary">
                <option value="">Semua kategori</option>
                {flatCategories.map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary-deep">
              Terapkan Filter
            </button>
          </form>
        </aside>

        {/* ===== Results ===== */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-muted">
              {query.q ? <>Hasil untuk “<span className="text-secondary">{query.q}</span>” · </> : null}
              {meta?.total ?? items.length} konten
            </p>
            <nav className="flex items-center gap-1 text-xs font-bold" aria-label="Urutkan">
              {[
                ["newest", "Terbaru"],
                ["popular", "Terpopuler"],
              ].map(([value, label]) => {
                const search = new URLSearchParams();
                for (const [key, v] of Object.entries(query)) {
                  if (v && key !== "sort" && key !== "page" && key !== "limit") search.set(key, v);
                }
                search.set("sort", value);
                const active = query.sort === value;
                return (
                  <Link
                    key={value}
                    href={`/contents?${search.toString()}`}
                    aria-current={active ? "true" : undefined}
                    className={`rounded-full px-4 py-2 transition ${active ? "bg-secondary text-white" : "border border-sand bg-white text-ink/75 hover:border-secondary/30"}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sand bg-white/60 px-6 py-16 text-center">
              <p className="font-heading text-lg font-bold text-secondary">Belum ada konten cocok</p>
              <p className="mt-1 text-sm text-muted">Coba longgarkan filternya — misalnya hapus kata kunci atau pilih usia lain.</p>
              <Link href="/contents" className="mt-5 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-deep">
                Lihat Semua Konten
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((content) => <ContentCard key={content.id} content={content} />)}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginasi">
              {meta.page > 1 && (
                <Link href={pageHref(meta.page - 1)} className="inline-flex items-center gap-1 rounded-2xl border border-sand bg-white px-4 py-2.5 text-xs font-bold text-secondary hover:border-secondary/40">
                  <ChevronLeft size={14} /> Sebelumnya
                </Link>
              )}
              <span className="text-xs font-semibold text-muted">Halaman {meta.page} dari {meta.totalPages}</span>
              {meta.page < meta.totalPages && (
                <Link href={pageHref(meta.page + 1)} className="inline-flex items-center gap-1 rounded-2xl border border-sand bg-white px-4 py-2.5 text-xs font-bold text-secondary hover:border-secondary/40">
                  Berikutnya <ChevronRight size={14} />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

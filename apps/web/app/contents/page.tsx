import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { ContentsFilter } from "@/components/contents-filter";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return {
    title: dict.contents.metaTitle,
    description: dict.contents.metaDescription,
  };
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContentsPage({ searchParams }: PageProps) {
  const { dict } = await getDictionary();
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const sort = get("sort") === "popular" ? "popular" : "latest";
  const query = {
    q: get("q"),
    type: get("type"),
    category: get("category"),
    ageGroup: get("ageGroup"),
    tag: get("tag"),
    sort,
    page: get("page") ?? "1",
    limit: "12",
  };

  // API failures throw (see lib/api.ts) — capture them here so we can show an
  // in-page "gagal memuat + coba lagi" card instead of a misleading empty state.
  let result: Awaited<ReturnType<typeof api.contents>> | null = null;
  let categories: Awaited<ReturnType<typeof api.categories>> = null;
  let ageGroups: Awaited<ReturnType<typeof api.ageGroups>> = null;
  let apiFailed = false;
  try {
    [result, categories, ageGroups] = await Promise.all([
      api.contents(query),
      api.categories(),
      api.ageGroups(),
    ]);
  } catch (error) {
    console.error("[contents] failed to load", error);
    apiFailed = true;
  }
  const items = result?.items ?? [];
  const meta = result?.meta ?? null;
  const flatCategories = (categories ?? []).flatMap((c) => [c, ...(c.children ?? [])]);

  function pageHref(page: number): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value && key !== "page" && key !== "limit" && key !== "sort") search.set(key, String(value));
      else if (key === "sort" && value && value !== "latest") search.set(key, String(value));
    }
    search.set("page", String(page));
    return `/contents?${search.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{dict.contents.kicker}</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">{dict.contents.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {meta
            ? format(dict.contents.subtitleTotal, { total: meta.total })
            : dict.contents.subtitleAll}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <ContentsFilter
          q={query.q}
          type={query.type}
          category={query.category}
          ageGroup={query.ageGroup}
          sort={sort}
          ageGroups={(ageGroups ?? []).map((group) => ({ id: group.id, slug: group.slug, name: group.name }))}
          categories={flatCategories.map((category) => ({ id: category.id, slug: category.slug, name: category.name }))}
        />

        {/* ===== Results ===== */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-muted">
              {query.q ? <>{format(dict.contents.resultsFor, { q: query.q })} · </> : null}
              {format(dict.contents.resultsCount, { count: meta?.total ?? items.length })}
            </p>
            <nav className="flex items-center gap-1 text-xs font-bold" aria-label={dict.contents.sortAria}>
              {([
                ["latest", dict.contents.sortNewest],
                ["popular", dict.contents.sortPopular],
              ] as Array<[string, string]>).map(([value, label]) => {
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

          {apiFailed ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center">
              <p className="font-heading text-lg font-bold text-red-800">{dict.common.loadError}</p>
              <Link href="/contents" className="mt-5 inline-block rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white hover:bg-red-700">
                {dict.common.retry}
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sand bg-white/60 px-6 py-16 text-center">
              <p className="font-heading text-lg font-bold text-secondary">{dict.contents.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted">{dict.contents.emptyHint}</p>
              <Link href="/contents" className="mt-5 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-deep">
                {dict.contents.viewAllContents}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((content) => <ContentCard key={content.id} content={content} />)}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label={dict.contents.paginationAria}>
              {meta.page > 1 && (
                <Link href={pageHref(meta.page - 1)} className="inline-flex items-center gap-1 rounded-2xl border border-sand bg-white px-4 py-2.5 text-xs font-bold text-secondary hover:border-secondary/40">
                  <ChevronLeft size={14} /> {dict.contents.prev}
                </Link>
              )}
              <span className="text-xs font-semibold text-muted">{format(dict.contents.pageOf, { page: meta.page, pages: meta.totalPages })}</span>
              {meta.page < meta.totalPages && (
                <Link href={pageHref(meta.page + 1)} className="inline-flex items-center gap-1 rounded-2xl border border-sand bg-white px-4 py-2.5 text-xs font-bold text-secondary hover:border-secondary/40">
                  {dict.contents.next} <ChevronRight size={14} />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

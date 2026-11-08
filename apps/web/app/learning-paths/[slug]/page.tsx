import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Clock, ListChecks, Rocket } from "lucide-react";
import { PathModuleLink } from "@/components/path-module-link";
import { api } from "@/lib/api";
import { PathProgress } from "@/components/path-progress";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";
import { gradientFor } from "@/lib/gradients";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { dict } = await getDictionary();
  const path = await api.learningPathBySlug(slug);
  if (!path) return { title: dict.paths.detailNotFound };
  return {
    title: `Learning Path: ${path.title}`,
    description: path.description ?? undefined,
    alternates: { canonical: `/learning-paths/${path.slug}` },
  };
}

export default async function LearningPathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { dict } = await getDictionary();
  const path = await api.learningPathBySlug(slug);
  if (!path) notFound();
  const items = path.items ?? [];
  const requiredCount = items.filter((item) => item.isRequired).length;
  const difficultyLabel = dict.paths[`difficulty${path.difficulty.charAt(0)}${path.difficulty.slice(1).toLowerCase()}` as "difficultyBeginner"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-muted">
        <Link href="/" className="hover:text-primary">{dict.contentDetail.home}</Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/learning-paths" className="hover:text-primary">{dict.paths.detailBreadcrumb}</Link>
        <ChevronRight size={12} aria-hidden />
        <span className="line-clamp-1 text-secondary">{path.title}</span>
      </nav>

      {/* ===== hero ===== */}
      <header className="relative mt-5 overflow-hidden rounded-[2rem] bg-secondary text-white shadow-[0_20px_50px_rgba(0,78,137,0.35)]">
        {path.thumbnailUrl ? (
          <>
            <img
              src={path.thumbnailUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* layered overlays keep text readable on any artwork */}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/75 to-secondary/15" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <span aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
            <span aria-hidden className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <span aria-hidden className={`absolute right-8 top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-[2rem] bg-gradient-to-br ${gradientFor(path.id)} opacity-80 sm:block`} />
          </>
        )}
        <div className="relative p-7 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/25 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-accent backdrop-blur-sm">
            <Rocket size={11} aria-hidden /> {dict.paths.kicker} · {difficultyLabel}
          </span>
          <h1 className="mt-4 max-w-xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl">{path.title}</h1>
          {path.description && <p className="mt-3 max-w-lg text-sm leading-6 text-white/85">{path.description}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-white/85 backdrop-blur-sm">
              <ListChecks size={12} aria-hidden /> {format(dict.paths.modules, { count: items.length })}
              {requiredCount > 0 && <span className="text-white/60">· {requiredCount} {dict.paths.required}</span>}
            </span>
            {path.estimatedTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-white/85 backdrop-blur-sm">
                <Clock size={12} aria-hidden /> {format(dict.paths.approxMinutes, { minutes: path.estimatedTime })}
              </span>
            )}
          </div>
          <PathProgress slug={path.slug} total={items.length} />
        </div>
      </header>

      {/* ===== modules ===== */}
      <ol className="mt-8 space-y-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <PathModuleLink slug={path.slug} moduleId={item.id} href={`/contents/${item.content.slug}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft font-heading text-base font-extrabold text-primary-deep">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">
                  {(dict.contentTypes as Record<string, string>)[item.content.type] ?? item.content.type} {item.isRequired ? `· ${dict.paths.required}` : `· ${dict.paths.optional}`}
                </span>
                <span className="mt-1 block font-heading text-base font-bold leading-snug text-secondary transition group-hover:text-primary-deep">
                  {item.content.title}
                </span>
                {item.content.excerpt && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">{item.content.excerpt}</span>}
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary">{dict.paths.readModule} <ArrowRight size={12} className="transition group-hover:translate-x-1" aria-hidden /></span>
              </span>
            </PathModuleLink>
          </li>
        ))}
      </ol>
    </div>
  );
}

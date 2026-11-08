import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Clock, GraduationCap, ListChecks, Rocket } from "lucide-react";
import { PathModuleLink } from "@/components/path-module-link";
import { api } from "@/lib/api";
import { PathProgress } from "@/components/path-progress";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";

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

      {/* ===== hero (home-paths signature, with artwork) ===== */}
      <header className="relative mt-5 overflow-hidden rounded-3xl bg-secondary text-white ring-1 ring-white/10">
        {path.thumbnailUrl ? (
          <>
            <img
              src={path.thumbnailUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* double overlay: keeps every word readable on any artwork */}
            <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/70 to-secondary/10" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/15 to-transparent" />
          </>
        ) : (
          <>
            {/* subtle star dots (theme dot-grid on dark) */}
            <span aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.13) 1.25px, transparent 1.25px)", backgroundSize: "22px 22px" }} />
            <span aria-hidden className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            <span aria-hidden className="absolute -bottom-14 left-1/3 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <GraduationCap size={110} strokeWidth={1.1} aria-hidden className="absolute -right-4 bottom-2 text-accent/25" />
          </>
        )}
        <div className="relative p-6 sm:p-9">
          <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#FFD9A0]">
            <Rocket size={12} aria-hidden /> {dict.paths.kicker} · {difficultyLabel}
          </span>
          <h1 className="mt-3 max-w-xl font-heading text-3xl font-extrabold leading-[1.15] sm:text-4xl">{path.title}</h1>
          {path.description && <p className="mt-3 max-w-lg text-sm leading-6 text-white/85">{path.description}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-white/90 backdrop-blur-sm">
              <ListChecks size={12} aria-hidden /> {format(dict.paths.modules, { count: items.length })}
              {requiredCount > 0 && <span className="text-white/60">· {requiredCount} {dict.paths.required}</span>}
            </span>
            {path.estimatedTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-white/90 backdrop-blur-sm">
                <Clock size={12} aria-hidden /> {format(dict.paths.approxMinutes, { minutes: path.estimatedTime })}
              </span>
            )}
          </div>
          <PathProgress slug={path.slug} total={items.length} />
        </div>
      </header>

      {/* ===== modules ===== */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-secondary">
          <ListChecks size={14} aria-hidden className="text-primary" /> {dict.paths.modulesHeading}
        </h2>
        <span className="rounded-full bg-secondary-soft px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary">
          {format(dict.paths.modules, { count: items.length })}
        </span>
      </div>
      <ol className="mt-4 space-y-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <PathModuleLink slug={path.slug} moduleId={item.id} href={`/contents/${item.content.slug}`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft font-heading text-base font-extrabold text-primary-deep">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-muted">
                    {(dict.contentTypes as Record<string, string>)[item.content.type] ?? item.content.type}
                  </span>
                  {item.isRequired ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-accent-deep">{dict.paths.required}</span>
                  ) : (
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-muted">{dict.paths.optional}</span>
                  )}
                </span>
                <span className="mt-1.5 block font-heading text-base font-bold leading-snug text-secondary transition group-hover:text-primary-deep">
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

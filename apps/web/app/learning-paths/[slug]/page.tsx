import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Clock, ListChecks } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-muted">
        <Link href="/" className="hover:text-primary">{dict.contentDetail.home}</Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/learning-paths" className="hover:text-primary">{dict.paths.detailBreadcrumb}</Link>
        <ChevronRight size={12} aria-hidden />
        <span className="text-secondary">{path.title}</span>
      </nav>

      <header className="mt-5 rounded-[2rem] bg-secondary p-7 text-white sm:p-9">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-accent">
          {dict.paths.kicker} · {path.difficulty}
        </span>
        <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight sm:text-4xl">{path.title}</h1>
        {path.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{path.description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-white/70">
          {path.estimatedTime && <span className="inline-flex items-center gap-1"><Clock size={12} /> {format(dict.paths.approxMinutes, { minutes: path.estimatedTime })}</span>}
          <span className="inline-flex items-center gap-1"><ListChecks size={12} /> {format(dict.paths.modules, { count: items.length })}</span>
        </div>
        <PathProgress slug={path.slug} total={items.length} />
      </header>

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

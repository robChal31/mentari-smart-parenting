import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgeCheck, CalendarDays, ChevronRight, Clock, Eye, Tag,
} from "lucide-react";
import { api } from "@/lib/api";
import { renderContentBody } from "@/lib/content-body";
import { formatDate, formatDuration, formatViews } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";
import { ContentCard } from "@/components/content-card";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { BookmarkButton } from "@/components/bookmark-button";
import { TrackView } from "@/components/track-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { dict } = await getDictionary();
  const content = await api.contentBySlug(slug);
  if (!content) return { title: dict.contentDetail.notFound };
  const description = content.metaDescription ?? content.excerpt ?? undefined;
  return {
    title: content.metaTitle ?? content.title,
    description,
    openGraph: {
      type: "article",
      title: content.title,
      description,
      publishedTime: content.publishedAt ?? undefined,
      authors: content.authorName ? [content.authorName] : undefined,
    },
    alternates: { canonical: `/contents/${content.slug}` },
  };
}

export default async function ContentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale, dict } = await getDictionary();
  const content = await api.contentBySlug(slug);
  if (!content) notFound();

  const sidebarProducts = content.recommendedProducts.slice(0, 3);
  const bottomProducts = content.recommendedProducts.slice(3);
  const inlineProduct = content.recommendedProducts.length >= 3 ? content.recommendedProducts[0] : null;
  const duration = formatDuration(content.videoDuration, dict.time);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": content.type === "VIDEO" ? "VideoObject" : "Article",
    headline: content.title,
    description: content.excerpt,
    datePublished: content.publishedAt,
    author: content.authorName ? { "@type": "Person", name: content.authorName } : undefined,
    publisher: { "@type": "Organization", name: "MentariSmartParent" },
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <TrackView contentId={content.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] font-semibold text-muted">
        <Link href="/" className="transition hover:text-primary">{dict.contentDetail.home}</Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/contents" className="transition hover:text-primary">{dict.contentDetail.contents}</Link>
        {content.categories[0] && (
          <>
            <ChevronRight size={12} aria-hidden />
            <Link href={`/contents?category=${content.categories[0].slug}`} className="transition hover:text-primary">
              {content.categories[0].name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ===== Main column ===== */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {content.categories.map((category) => (
              <Link
                key={category.slug}
                href={`/contents?category=${category.slug}`}
                className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary"
                style={{ background: (category.color ?? "#004E89") + "1F" }}
              >
                {category.name}
              </Link>
            ))}
            {content.ageGroups.slice(0, 3).map((group) => (
              <Link
                key={group.slug}
                href={`/contents?ageGroup=${group.slug}`}
                className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold text-muted transition hover:text-primary"
              >
                {group.name}
              </Link>
            ))}
          </div>

          <h1 className="mt-4 font-heading text-3xl font-extrabold leading-[1.18] tracking-tight text-secondary sm:text-4xl">
            {content.title}
          </h1>
          {content.excerpt && <p className="mt-3 text-lg leading-7 text-muted">{content.excerpt}</p>}

          {/* Author & actions row */}
          <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-sand py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-sm font-extrabold text-white">
                {(content.authorName ?? "M").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{content.authorName ?? dict.contentDetail.byline}</span>
                <span className="block text-[11px] text-muted">{content.authorTitle ?? dict.contentDetail.editorialTeam}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted">
              <span className="inline-flex items-center gap-1"><CalendarDays size={12} aria-hidden />{formatDate(content.publishedAt, locale)}</span>
              {content.readTime && <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden />{format(dict.contentDetail.minutesRead, { minutes: content.readTime })}</span>}
              <span className="inline-flex items-center gap-1"><Eye size={12} aria-hidden />{format(dict.contentDetail.viewsSeen, { views: formatViews(content.viewCount, dict.time) })}</span>
              {duration && <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden />{duration}</span>}
            </div>
            <div className="ml-auto">
              <BookmarkButton contentId={content.id} />
            </div>
          </div>

          {/* Video embed */}
          {content.type === "VIDEO" && content.videoUrl && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-sand shadow-sm">
              <div className="aspect-video w-full bg-secondary">
                <iframe
                  src={content.videoUrl.includes("/embed/") ? content.videoUrl : `https://www.youtube.com/embed/${content.videoUrl}`}
                  title={`Video: ${content.title}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Body */}
          {content.body && (
            <div className="prose-mentari mt-4 max-w-none">
              {renderContentBody(content.body)}
            </div>
          )}

          {/* Inline recommendation (≥3 mapped products) */}
          {inlineProduct && (
            <div className="mt-6">
              <RecommendationsPanel
                products={[inlineProduct]}
                source="INLINE"
                contentId={content.id}
                compact
                subtitle={dict.recommendations.subtitleInline}
              />
            </div>
          )}

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-muted" aria-hidden />
              {content.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-sand bg-white px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-primary/40 hover:text-primary"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Bottom recommendations */}
          {bottomProducts.length > 0 && (
            <div className="mt-6">
              <RecommendationsPanel products={bottomProducts} source="BOTTOM" contentId={content.id} compact />
            </div>
          )}

          {/* Author box */}
          {content.authorName && (
            <div className="mt-8 flex items-start gap-4 rounded-3xl border border-sand bg-secondary-soft/30 p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-lg font-extrabold text-white">
                {content.authorName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </span>
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-accent-deep">
                  <BadgeCheck size={12} aria-hidden /> {dict.contentDetail.verifiedAuthor}
                </p>
                <p className="mt-1 font-heading text-base font-bold text-secondary">{content.authorName}</p>
                <p className="text-xs text-muted">{content.authorTitle}</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {dict.contentDetail.authorBoxText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===== Sidebar ===== */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            {sidebarProducts.length > 0 && (
              <RecommendationsPanel
                products={sidebarProducts}
                source="SIDEBAR"
                contentId={content.id}
                subtitle={dict.recommendations.subtitleContent}
              />
            )}
            <div className="rounded-3xl border border-sand bg-white p-5">
              <p className="font-heading text-sm font-extrabold text-secondary">{dict.contentDetail.aboutTitle}</p>
              <p className="mt-1.5 text-xs leading-5 text-muted">
                {dict.contentDetail.aboutText}
              </p>
              <Link href="/about" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
                {dict.contentDetail.knowMore}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Related contents ===== */}
      {content.relatedContents.length > 0 && (
        <section className="mt-12 border-t border-sand pt-8" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-heading text-xl font-extrabold text-secondary">{dict.contentDetail.readAlso}</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.relatedContents.map((related) => <ContentCard key={related.id} content={related} />)}
          </div>
        </section>
      )}
    </article>
  );
}

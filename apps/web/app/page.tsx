import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Baby, BadgeCheck, BookOpenText, Flame, Lock, MessagesSquare,
  Rocket, ShieldCheck, Sparkles, Stethoscope, UserRoundCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { formatRelativeTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { locale, dict } = await getDictionary();
  const [featured, latest, categories, ageGroups, products, learningPaths, threads] = await Promise.all([
    api.contentsFeatured(4),
    api.contents({ sort: "latest", limit: "4" }),
    api.categories(),
    api.ageGroups(),
    api.products({ featured: "true" }),
    api.learningPaths(),
    api.threads({ limit: "3" }),
  ]);

  const featuredItems = featured ?? [];
  const latestItems = latest.items;
  const flatCategories = (categories ?? []).flatMap((c) => [c, ...(c.children ?? [])]).slice(0, 12);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="dot-grid relative overflow-hidden border-b border-sand">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
          <div className="fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep">
              <Stethoscope size={13} aria-hidden /> {dict.home.heroBadge}
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-secondary sm:text-5xl xl:text-[3.6rem]">
              {dict.home.heroTitleA} <span className="text-primary">{dict.home.heroTitleB}</span>{dict.home.heroTitleC}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              {dict.home.heroSub}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/contents"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,107,53,0.4)] transition hover:bg-primary-deep"
              >
                {dict.home.ctaExplore} <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                href="/learning-paths"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-secondary/15 bg-white px-6 py-3.5 font-heading text-sm font-bold text-secondary transition hover:border-secondary/35 hover:bg-secondary-soft"
              >
                <Rocket size={17} aria-hidden /> {dict.home.ctaPath}
              </Link>
            </div>
            <dl className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-secondary">
              <div>
                <dt className="sr-only">{dict.home.statSrContents}</dt>
                <dd className="font-heading text-2xl font-extrabold">250+</dd>
                <dd className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dict.home.statContents}</dd>
              </div>
              <div>
                <dt className="sr-only">{dict.home.statSrMilestones}</dt>
                <dd className="font-heading text-2xl font-extrabold">23</dd>
                <dd className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dict.home.statMilestones}</dd>
              </div>
              <div>
                <dt className="sr-only">{dict.home.statSrFree}</dt>
                <dd className="font-heading text-2xl font-extrabold">100%</dd>
                <dd className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dict.home.statFree}</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-[0_30px_80px_rgba(0,78,137,0.25)]">
              <Image
                src="/images/hero-keluarga.png"
                alt={dict.home.heroAlt}
                width={880}
                height={880}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            {/* floating cards */}
            <div className="absolute -left-3 top-6 flex items-center gap-2 rounded-2xl border border-sand bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:-left-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent-deep">
                <BadgeCheck size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold text-secondary">{dict.home.milestoneCardTitle}</span>
                <span className="block text-[9px] font-medium text-muted">{dict.home.milestoneCardSub}</span>
              </span>
            </div>
            <div className="absolute -right-2 bottom-8 flex items-center gap-2 rounded-2xl border border-sand bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:-right-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <Flame size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold text-secondary">{dict.home.streakCardTitle}</span>
                <span className="block text-[9px] font-medium text-muted">{dict.home.streakCardSub}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AGE GROUP RAIL ============ */}
      {ageGroups && ageGroups.length > 0 && (
        <section aria-label={dict.home.ageRailAria} className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
          <div className="chip-rail flex items-center gap-2 overflow-x-auto pb-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
              <Baby size={15} aria-hidden /> {dict.home.ageRailLabel}
            </span>
            {ageGroups.map((group) => (
              <Link
                key={group.id}
                href={`/contents?ageGroup=${group.slug}`}
                className="shrink-0 rounded-full border border-sand bg-white px-4 py-2 text-xs font-bold text-secondary transition hover:border-primary hover:bg-primary-soft hover:text-primary-deep"
              >
                {group.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ TRENDING ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6" aria-labelledby="trending-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
              <Flame size={13} fill="currentColor" aria-hidden /> {dict.home.trendingKicker}
            </p>
            <h2 id="trending-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.trendingTitle}</h2>
          </div>
          <Link href="/contents?sort=popular" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
            {dict.home.viewAll} <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredItems.map((content) => <ContentCard key={content.id} content={content} priority />)}
        </div>
      </section>

      {/* ============ KATEGORI ============ */}
      {flatCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="kategori-heading">
          <h2 id="kategori-heading" className="font-heading text-xl font-extrabold text-secondary">{dict.home.popularTopics}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {flatCategories.map((category) => (
              <Link
                key={category.id}
                href={`/contents?category=${category.slug}`}
                className="rounded-2xl border border-sand bg-white px-4 py-2.5 text-xs font-semibold text-ink/85 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/30 hover:text-secondary"
                style={category.color ? { borderLeft: `4px solid ${category.color}` } : undefined}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ LEARNING PATHS ============ */}
      {learningPaths && learningPaths.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="paths-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-deep">
                <Rocket size={13} aria-hidden /> {dict.home.pathsKicker}
              </p>
              <h2 id="paths-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.pathsTitle}</h2>
            </div>
            <Link href="/learning-paths" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
              {dict.home.allPaths} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {learningPaths.map((path) => (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-secondary p-6 text-white transition hover:bg-secondary-deep"
              >
                <div aria-hidden className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent/20 blur-2xl transition group-hover:bg-accent/30" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent">{path.difficulty} · {path.estimatedTime} {dict.home.minutes}</p>
                <h3 className="mt-2 font-heading text-xl font-extrabold leading-snug">{path.title}</h3>
                {path.description && <p className="mt-2 line-clamp-2 max-w-md text-sm leading-6 text-white/75">{path.description}</p>}
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#FFD9A0]">
                  {dict.home.startThisPath} <ArrowRight size={13} className="transition group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ ARTIKEL TERBARU ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="latest-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-secondary">
              <BookOpenText size={13} aria-hidden /> {dict.home.latestKicker}
            </p>
            <h2 id="latest-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.latestTitle}</h2>
          </div>
          <Link href="/contents?sort=latest" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
            {dict.home.viewAll} <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latestItems.map((content) => <ContentCard key={content.id} content={content} />)}
        </div>
      </section>

      {/* ============ PRODUK MENTARI ============ */}
      {products && products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
          <RecommendationsPanel
            products={products.slice(0, 4)}
            source="BANNER"
            subtitle={dict.recommendations.subtitleHome}
            compact
          />
        </section>
      )}

      {/* ============ KOMUNITAS ============ */}
      {threads.items.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="komunitas-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
                <MessagesSquare size={13} aria-hidden /> {dict.home.communityKicker}
              </p>
              <h2 id="komunitas-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.communityTitle}</h2>
            </div>
            <Link href="/community" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
              {dict.home.joinDiscussion} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {threads.items.map((thread) => (
              <Link
                key={thread.id}
                href={`/community/${thread.id}`}
                className="flex h-full flex-col rounded-3xl border border-sand bg-white p-5 transition hover:border-primary/30 hover:shadow-md"
              >
                {thread.isPinned && (
                  <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
                    📌 {dict.home.pinned}
                  </span>
                )}
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{thread.title}</h3>
                <p className="mt-auto pt-3 text-[10px] font-medium text-muted">
                  {thread.author.fullName} · {formatRelativeTime(thread.createdAt, locale, dict.time)} · {thread.commentCount} {dict.home.comments}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-[#FF8E53] px-6 py-12 text-center text-white sm:px-12">
          <div aria-hidden className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="absolute -bottom-12 right-0 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
          <ShieldCheck size={40} className="mx-auto text-[#FFE27A]" aria-hidden />
          <h2 className="mt-4 font-heading text-2xl font-extrabold sm:text-3xl">{dict.home.finalTitle}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/85">
            {dict.home.finalSub}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-heading text-sm font-bold text-primary-deep transition hover:bg-cream">
              <UserRoundCheck size={17} aria-hidden /> {dict.home.finalCta}
            </Link>
            <Link href="/contents" className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-6 py-3.5 font-heading text-sm font-bold text-white transition hover:bg-white/10">
              {dict.home.finalBrowse} <ArrowRight size={17} aria-hidden />
            </Link>
          </div>
          <p className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            <Lock size={11} aria-hidden /> {dict.home.finalNote}
          </p>
        </div>
      </section>
    </>
  );
}

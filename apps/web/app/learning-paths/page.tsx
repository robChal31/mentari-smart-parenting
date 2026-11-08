import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, GraduationCap, ListChecks, Rocket } from "lucide-react";
import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";
import { gradientFor } from "@/lib/gradients";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.paths.kicker, description: dict.paths.listSub };
}

export default async function LearningPathsPage() {
  const { dict } = await getDictionary();
  const paths = (await api.learningPaths()) ?? [];
  const difficultyLabel = (difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED") =>
    dict.paths[`difficulty${difficulty.charAt(0)}${difficulty.slice(1).toLowerCase()}` as "difficultyBeginner"];

  return (
    <div className="relative mx-auto max-w-7xl overflow-hidden px-4 py-10 sm:px-6">
      {/* decorative background blobs */}
      <span aria-hidden className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <header className="relative max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-deep">
          <Rocket size={13} aria-hidden /> {dict.paths.kicker}
        </p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.15] text-secondary sm:text-5xl">{dict.paths.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          {dict.paths.listSub}
        </p>
      </header>

      <div className="relative mt-8 grid gap-6 md:grid-cols-2">
        {paths.map((path) => {
          const itemCount = (path as { itemCount?: number }).itemCount ?? 0;
          return (
            <Link
              key={path.id}
              href={`/learning-paths/${path.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-sand bg-white shadow-[0_2px_10px_rgba(38,50,68,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_20px_45px_rgba(255,107,53,0.16)]"
            >
              {/* thumbnail */}
              <div className={`relative h-44 w-full overflow-hidden sm:h-48 ${path.thumbnailUrl ? "" : `bg-gradient-to-br ${gradientFor(path.id)}`}`}>
                {path.thumbnailUrl ? (
                  <img
                    src={path.thumbnailUrl}
                    alt={path.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <>
                    <span aria-hidden className="absolute -left-6 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
                    <span aria-hidden className="absolute -bottom-10 right-6 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
                    <GraduationCap size={64} className="absolute bottom-6 left-6 text-secondary/70" aria-hidden strokeWidth={1.4} />
                  </>
                )}
                {/* readability gradient on top of photos */}
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-secondary/60 via-secondary/10 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-secondary backdrop-blur">
                  {difficultyLabel(path.difficulty)}
                </span>
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                  <ListChecks size={11} aria-hidden /> {format(dict.paths.modules, { count: itemCount })}
                </span>
              </div>

              {/* body */}
              <div className="flex flex-1 flex-col gap-2 p-6">
                <h2 className="font-heading text-xl font-extrabold leading-snug text-ink transition-colors group-hover:text-secondary">
                  {path.title}
                </h2>
                {path.description && <p className="line-clamp-3 text-xs leading-5 text-muted">{path.description}</p>}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-sand/80 pt-3.5">
                  <span className="inline-flex items-center gap-3 text-[11px] font-semibold text-muted">
                    {path.estimatedTime && (
                      <span className="inline-flex items-center gap-1.5"><Clock size={12} aria-hidden /> {format(dict.paths.minutesTotal, { minutes: path.estimatedTime })}</span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-2 font-heading text-[12px] font-bold text-primary transition group-hover:gap-3 group-hover:text-primary-deep">
                    {dict.paths.startLearning} <ArrowRight size={14} aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {paths.length === 0 && <p className="mt-16 text-center text-sm text-muted">{dict.paths.listEmpty}</p>}
    </div>
  );
}

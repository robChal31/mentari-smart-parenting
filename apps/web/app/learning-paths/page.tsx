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
    <div>
      {/* ===== header band (dot-grid, like the home hero) ===== */}
      <section className="dot-grid relative overflow-hidden border-b border-sand">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep">
            <Rocket size={13} aria-hidden /> {dict.paths.kicker}
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-secondary sm:text-5xl">
            {dict.paths.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted">
            {dict.paths.listSub}
          </p>
        </div>
      </section>

      {/* ===== path cards (signature dark cards from the home page) ===== */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {paths.map((path) => {
            const itemCount = (path as { itemCount?: number }).itemCount ?? 0;
            return (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-secondary text-white ring-1 ring-white/5 transition hover:bg-secondary-deep sm:flex-row"
              >
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-accent/20 blur-2xl transition group-hover:bg-accent/30" />
                {/* artwork — top band on mobile, right panel on sm+ */}
                <div className="relative h-36 w-full shrink-0 sm:hidden">
                  {path.thumbnailUrl ? (
                    <>
                      <img
                        src={path.thumbnailUrl}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/35 to-transparent" />
                    </>
                  ) : (
                    <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${gradientFor(path.id)} opacity-90`}>
                      <span className="absolute inset-0 bg-secondary/25" />
                      <GraduationCap size={48} strokeWidth={1.4} className="absolute bottom-3 left-5 text-white/45" />
                    </div>
                  )}
                </div>
                <div className="relative flex min-w-0 flex-1 flex-col p-6 sm:p-7">
                  <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-accent">
                    {difficultyLabel(path.difficulty)}
                    {path.estimatedTime ? <span className="text-white/55"> · {format(dict.paths.minutesTotal, { minutes: path.estimatedTime })}</span> : null}
                  </p>
                  <h2 className="mt-4 font-heading text-xl font-extrabold leading-snug sm:text-2xl">
                    {path.title}
                  </h2>
                  {path.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/75">{path.description}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/85">
                      <ListChecks size={12} aria-hidden /> {format(dict.paths.modules, { count: itemCount })}
                    </span>
                    <span className="inline-flex items-center gap-2 font-heading text-[12px] font-bold text-[#FFD9A0] transition group-hover:gap-3">
                      {dict.paths.startLearning} <ArrowRight size={15} aria-hidden />
                    </span>
                  </div>
                </div>
                {/* artwork panel — melts into the card via a left fade */}
                <div className="relative hidden w-36 shrink-0 sm:block md:w-48 lg:w-44 xl:w-52">
                  {path.thumbnailUrl ? (
                    <>
                      <img
                        src={path.thumbnailUrl}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/35 to-transparent" />
                    </>
                  ) : (
                    <div aria-hidden className={`absolute inset-0 bg-gradient-to-br ${gradientFor(path.id)} opacity-90`}>
                      <span className="absolute inset-0 bg-secondary/25" />
                      <GraduationCap size={56} strokeWidth={1.4} className="absolute bottom-4 right-4 text-white/45" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {paths.length === 0 && (
          <p className="mt-6 rounded-3xl border border-dashed border-sand bg-white/60 px-6 py-16 text-center text-sm text-muted">{dict.paths.listEmpty}</p>
        )}
      </div>
    </div>
  );
}

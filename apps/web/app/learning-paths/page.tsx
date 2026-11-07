import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock, ListChecks, Rocket } from "lucide-react";
import { api } from "@/lib/api";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { format } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";


export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.paths.kicker, description: dict.paths.listSub };
}

export default async function LearningPathsPage() {
  const { dict } = await getDictionary();
  const paths = (await api.learningPaths()) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-deep">
          <Rocket size={13} aria-hidden /> {dict.paths.kicker}
        </p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-secondary">{dict.paths.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {dict.paths.listSub}
        </p>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {paths.map((path) => (
          <Link key={path.id} href={`/learning-paths/${path.slug}`} className="group flex flex-col overflow-hidden rounded-[2rem] bg-secondary text-white transition hover:bg-secondary-deep">
            <div className="flex flex-1 flex-col p-7">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-accent">
                {path.difficulty}
              </span>
              <h2 className="mt-4 font-heading text-2xl font-extrabold leading-snug">{path.title}</h2>
              {path.description && <p className="mt-2 text-sm leading-6 text-white/75">{path.description}</p>}
              <div className="mt-5 flex items-center gap-4 text-[11px] font-semibold text-white/70">
                {path.estimatedTime && <span className="inline-flex items-center gap-1"><Clock size={12} /> {format(dict.paths.minutesTotal, { minutes: path.estimatedTime })}</span>}
                <span className="inline-flex items-center gap-1"><ListChecks size={12} /> {format(dict.paths.modules, { count: (path as { itemCount?: number }).itemCount ?? "?" })}</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-bold text-[#FFD9A0]">
                {dict.paths.startLearning} <ArrowRight size={15} className="transition group-hover:translate-x-1.5" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {paths.length === 0 && <p className="mt-16 text-center text-sm text-muted">{dict.paths.listEmpty}</p>}
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenText, HeartHandshake, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return {
    title: dict.static.aboutKicker,
    description: dict.static.groupText,
  };
}

export default async function AboutPage() {
  const { dict } = await getDictionary();

  const pillarIcons = [<Stethoscope key="steth" size={22} />, <ShieldCheck key="shield" size={22} />, <HeartHandshake key="heart" size={22} />];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{dict.static.aboutKicker}</p>
      <h1 className="mt-2 font-heading text-4xl font-extrabold leading-tight text-secondary">{dict.static.aboutHeroA} <span className="text-primary">{dict.static.aboutHeroB}</span>{dict.static.aboutHeroC}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        {dict.static.aboutMissionPre}{" "}<strong>{dict.static.aboutWord1}</strong>, <strong>{dict.static.aboutWord2}</strong>, {dict.static.andWord} <strong>{dict.static.aboutWord3}</strong>.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {dict.static.pillars.map((pillar, index) => (
          <div key={pillar.title} className="rounded-3xl border border-sand bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-deep">{pillarIcons[index]}</span>
            <h2 className="mt-3 font-heading text-base font-extrabold text-secondary">{pillar.title}</h2>
            <p className="mt-1 text-xs leading-6 text-muted">{pillar.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="inline-flex items-center gap-2 font-heading text-2xl font-extrabold text-secondary"><Users size={22} aria-hidden /> {dict.static.expertsTitle}</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {dict.static.experts.map(([name, role, bio]) => (
            <li key={name} className="flex items-start gap-4 rounded-3xl border border-sand bg-white p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-base font-extrabold text-white">
                {name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("")}
              </span>
              <span>
                <span className="block font-heading text-sm font-bold text-secondary">{name}</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-accent-deep">{role}</span>
                <span className="mt-1.5 block text-xs leading-5 text-muted">{bio}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-[2rem] bg-secondary p-8 text-white">
        <Sparkles size={26} className="text-[#FFD9A0]" aria-hidden />
        <h2 className="mt-3 font-heading text-2xl font-extrabold">{dict.static.groupTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/80">{dict.static.groupText}</p>
        <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-secondary-deep transition hover:bg-accent-deep hover:text-white">
          <BookOpenText size={16} aria-hidden /> {dict.static.seeProducts} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.privacy.title };
}

export default async function PrivacyPage() {
  const { dict } = await getDictionary();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">{dict.privacy.kicker}</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-secondary">{dict.privacy.title}</h1>
      <p className="mt-2 text-sm text-muted">{dict.privacy.version}</p>
      {dict.privacy.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="font-heading text-lg font-extrabold text-secondary">{section.heading}</h2>
          <p className="mt-2 text-sm leading-7 text-ink/85">{section.body}</p>
        </section>
      ))}
    </article>
  );
}

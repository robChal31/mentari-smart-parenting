import Link from "next/link";
import { Sun } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function SiteFooter() {
  const { dict } = await getDictionary();

  return (
    <footer className="mt-16 bg-secondary text-white/85">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-heading text-lg font-bold text-white">{dict.footer.newsletterTitle}</p>
            <p className="mt-1 text-sm text-white/70">{dict.footer.newsletterSub}</p>
          </div>
          <NewsletterForm compact />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
              <Sun size={17} className="text-[#FFD9A0]" fill="currentColor" aria-hidden />
            </span>
            <p className="font-heading font-extrabold text-white">MentariSmartParent</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/65">{dict.footer.tagline}</p>
        </div>
        <nav aria-label={dict.footer.exploreCol}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{dict.footer.exploreCol}</p>
          <FooterLinks links={[
            ["/contents", dict.footer.articles],
            ["/learning-paths", dict.nav.learningPath],
            ["/development", dict.footer.developmentMilestones],
            ["/community", dict.footer.communityParents],
            ["/products", dict.footer.productsRecommendation],
          ]} />
        </nav>
        <nav aria-label={dict.footer.helpCol}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{dict.footer.helpCol}</p>
          <FooterLinks links={[
            ["/about", dict.footer.aboutUs],
            ["/help", dict.footer.helpFaq],
            ["/privacy", dict.footer.privacy],
            ["/terms", dict.footer.terms],
          ]} />
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{dict.footer.parentsCol}</p>
          <FooterLinks links={[
            ["/register", dict.footer.createAccount],
            ["/login", dict.nav.login],
            ["/profile", dict.footer.profileBookmarks],
            ["/products", dict.footer.teacherAcademy],
          ]} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} MentariSmartParent · Mentari Group. {dict.footer.rights}</p>
          <p>{dict.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ links }: { links: Array<[string, string]> }) {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {links.map(([href, label]) => (
        <li key={href}>
          <Link href={href} className="transition hover:text-white hover:underline underline-offset-4">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

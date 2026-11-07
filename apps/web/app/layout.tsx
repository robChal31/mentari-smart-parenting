import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { I18nProvider } from "@/components/i18n-provider";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getDictionary();
  return {
    metadataBase: new URL(SITE),
    title: {
      default: dict.seo.titleDefault,
      template: "%s · MentariSmartParent",
    },
    description: dict.seo.description,
    keywords: [...dict.seo.keywords],
    openGraph: {
      type: "website",
      locale: dict.seo.ogLocale,
      siteName: "MentariSmartParent",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getDictionary();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col bg-cream text-ink antialiased">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-secondary focus:px-4 focus:py-2 focus:text-white"
        >
          {dict.nav.skipToContent}
        </a>
        <I18nProvider locale={locale} dict={dict}>
          <AuthProvider>
            <SiteHeader />
            <main id="konten-utama" className="flex-1">{children}</main>
            <SiteFooter />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

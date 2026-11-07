import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "MentariSmartParent — Sahabat Tumbuh Kembang Anak Indonesia",
    template: "%s · MentariSmartParent",
  },
  description:
    "Tips parenting berbasis bukti dari psikolog dan dokter anak: MPASI, stimulasi, tantrum, sleep training, persiapan sekolah — lengkap dengan rekomendasi produk Mentari Group.",
  keywords: [
    "parenting", "pola asuh", "tumbuh kembang anak", "MPASI", "tantrum",
    "persiapan sekolah", "Mentari Smart Parent", "tips parenting Indonesia",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MentariSmartParent",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-cream text-ink antialiased">
        <a href="#konten-utama" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-secondary focus:px-4 focus:py-2 focus:text-white">
          Lewati ke konten
        </a>
        <AuthProvider>
          <SiteHeader />
          <main id="konten-utama" className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

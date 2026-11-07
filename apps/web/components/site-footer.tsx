import Link from "next/link";
import { Sun } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-secondary text-white/85">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="font-heading text-lg font-bold text-white">Kabar Mentari — setiap Jumat, 5 menit</p>
            <p className="mt-1 text-sm text-white/70">Rangkuman tips parenting tervalidasi ahli, langsung ke inbox Anda. Gratis, tanpa spam.</p>
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
          <p className="mt-3 text-sm leading-6 text-white/65">
            Sahabat tumbuh-kembang anak Indonesia — konten parenting berbasis bukti dari psikolog, dokter anak, dan pendidik.
          </p>
        </div>
        <nav aria-label="Jelajah">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Jelajah</p>
          <FooterLinks links={[
            ["/contents", "Artikel & Video"],
            ["/learning-paths", "Learning Path"],
            ["/perkembangan", "Milestone Perkembangan"],
            ["/komunitas", "Komunitas Orang Tua"],
            ["/produk", "Rekomendasi Produk Mentari"],
          ]} />
        </nav>
        <nav aria-label="Bantuan">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Bantuan</p>
          <FooterLinks links={[
            ["/tentang", "Tentang Kami"],
            ["/bantuan", "Pusat Bantuan & FAQ"],
            ["/kebijakan-privasi", "Kebijakan Privasi"],
            ["/syarat-ketentuan", "Syarat & Ketentuan"],
          ]} />
        </nav>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Untuk Orang Tua</p>
          <FooterLinks links={[
            ["/daftar", "Buat Akun Gratis"],
            ["/masuk", "Masuk"],
            ["/profil", "Profil & Bookmark"],
            ["/produk", "Teacher Academy & Produk Mentari"],
          ]} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} MentariSmartParent · Mentari Group. Seluruh hak cipta dilindungi.</p>
          <p>Konten disusun oleh tenaga ahli berlisensi. Bukan pengganti diagnosis medis.</p>
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

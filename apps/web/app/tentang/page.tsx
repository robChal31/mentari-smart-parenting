import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpenText, HeartHandshake, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang MentariSmartParent",
  description: "Platform parenting berbasis bukti untuk keluarga Indonesia — dikurasi psikolog, dokter anak, dan pendidik.",
};

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Tentang Kami</p>
      <h1 className="mt-2 font-heading text-4xl font-extrabold leading-tight text-secondary">Setiap anak Indonesia layak tumbuh <span className="text-primary">cerdas & bahagia</span>.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        MentariSmartParent lahir dari satu keyakinan sederhana: orang tua tidak butuh lebih banyak informasi —
        mereka butuh informasi yang <strong>benar</strong>, <strong>praktis</strong>, dan <strong>bisa dipercaya</strong>.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: <Stethoscope size={22} />, title: "Berbasis Bukti", desc: "Setiap artikel ditulis atau ditinjau psikolog, dokter anak, dan pendidik berlisensi." },
          { icon: <ShieldCheck size={22} />, title: "Bebas Bias", desc: "Rekomendasi produk selalu transparan dan diberi label — Anda yang memutuskan." },
          { icon: <HeartHandshake size={22} />, title: "Untuk Semua", desc: "100% gratis. Tidak ada paywall untuk konten inti tumbuh kembang anak." },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-sand bg-white p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-deep">{item.icon}</span>
            <h2 className="mt-3 font-heading text-base font-extrabold text-secondary">{item.title}</h2>
            <p className="mt-1 text-xs leading-6 text-muted">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="inline-flex items-center gap-2 font-heading text-2xl font-extrabold text-secondary"><Users size={22} aria-hidden /> Tim Ahli Kami</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["Mira Adityasari, M.Psi.", "Psikolog Anak & Keluarga", "10 tahun menangani tantrum, sibling rivalry, dan stimulasi dini."],
            ["dr. Sari Wulandari, Sp.A", "Dokter Spesialis Anak", "Fokus pada nutrisi, imunisasi, dan tumbuh kembang 0–6 tahun."],
            ["Dimas Prakoso", "Neurosains & Edukasi", "Active recall, spaced repetition, dan desain kurikulum anak."],
            ["Ratna Ningrum, S.Pd.", "Pendidik Anak Usia Dini", "Metode bermain sambil belajar dan kesiapan sekolah."],
          ].map(([name, role, bio]) => (
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
        <h2 className="mt-3 font-heading text-2xl font-extrabold">Bagian dari Mentari Group</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/80">
          MentariSmartParent terhubung dengan ekosistem Mentari Group: buku pendidikan nasional & internasional,
          buku cerita anak, pembelajaran digital, English Master Assessment, dan Teacher Academy.
          Kami merekomendasikan produk kami sendiri dengan jujur — dan selalu memberi labelnya.
        </p>
        <Link href="/produk" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-secondary-deep transition hover:bg-accent-deep hover:text-white">
          <BookOpenText size={16} aria-hidden /> Lihat Rekomendasi Produk <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  );
}

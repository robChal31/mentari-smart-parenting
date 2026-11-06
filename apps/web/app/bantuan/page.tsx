"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Mail } from "lucide-react";

const FAQ: Array<[string, string]> = [
  ["Apakah MentariSmartParent gratis?", "Ya. Seluruh konten artikel, video, learning path, tracker milestone, dan komunitas gratis selamanya. Beberapa produk Mentari Group yang direkomendasikan berbayar — namun rekomendasinya selalu berlabel dan tidak memengaruhi konten editorial."],
  ["Siapa yang menulis konten di sini?", "Tim editorial Mentari yang beranggotakan psikolog (M.Psi.), dokter spesialis anak (Sp.A), pendidik, dan spesialis neurosains. Setiap konten ditinjau sebelum terbit dan diperbarui berkala."],
  ["Bagaimana cara memakai tracker milestone?", "Buat profil anak di halaman Profil (nama + tanggal lahir), lalu buka halaman Perkembangan. Milestone akan otomatis disesuaikan dengan usia anak. Centang setiap milestone yang sudah tercapai — progres tersimpan otomatis."],
  ["Apa itu Learning Path?", "Rangkaian konten urut sesuai tema besar — misalnya MPASI 6 Bulan Pertama atau Persiapan Anak Masuk SD. Selesaikan modul-modulnya satu per satu dan tandai progresnya."],
  ["Bagaimana cara kerja streak dan poin?", "Setiap login harian menambah streak kamu dan memberi 5 poin. Streak 7 dan 30 hari memberi badge khusus. Membaca konten, menyimpan bookmark, dan berdiskusi di komunitas juga memberi poin."],
  ["Apakah data anak saya aman?", "Data anak hanya dipakai untuk mempersonalisasi konten dan rekomendasi di akunmu. Kami tidak menjual data. Lihat Kebijakan Privasi untuk detail."],
  ["Saya menemukan kesalahan informasi. Harus bagaimana?", "Kirim email ke halo@mentari.id dengan subjek 'Koreksi Konten' beserta judul artikelnya. Tim kami akan meninjau dalam 2 hari kerja."],
];

export default function BantuanPage() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary-soft text-secondary"><HelpCircle size={26} aria-hidden /></span>
      <h1 className="mt-5 font-heading text-3xl font-extrabold text-secondary">Pusat Bantuan</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Jawaban cepat untuk pertanyaan yang paling sering ditanyakan orang tua.</p>

      <div className="mt-8 divide-y divide-sand overflow-hidden rounded-3xl border border-sand bg-white">
        {FAQ.map(([question, answer], index) => {
          const isOpen = open === index;
          return (
            <div key={index}>
              <button
                onClick={() => setOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-cream/50"
              >
                <span className="text-sm font-bold text-ink">{question}</span>
                <ChevronDown size={18} className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {isOpen && <div className="px-6 pb-5"><p className="max-w-2xl text-sm leading-7 text-muted">{answer}</p></div>}
            </div>
          );
        })}
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-cream px-5 py-4 text-xs text-muted">
        <Mail size={14} aria-hidden /> Belum terjawab? Email <a href="mailto:halo@mentari.id" className="font-bold text-secondary hover:underline">halo@mentari.id</a> · atau tanya di <Link href="/komunitas" className="font-bold text-primary hover:underline">Komunitas</Link>
      </p>
    </div>
  );
}

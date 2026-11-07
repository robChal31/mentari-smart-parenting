import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kebijakan Privasi" };

const SECTIONS: Array<[string, string]> = [
  ["Data yang Kami Kumpulkan", "Data akun (nama, email, password terenkripsi), data anak yang Anda masukkan (nama panggilan, tanggal lahir, jenis kelamin opsional), aktivitas membaca (konten yang dibuka, bookmark), serta data teknis standar (perangkat, browser, alamat IP anonim untuk statistik agregat)."],
  ["Bagaimana Kami Menggunakannya", "Semata untuk: (1) personalisasi konten dan rekomendasi sesuai usia anak, (2) progres badge/streak/learning path, (3) statistik agregat untuk meningkatkan kualitas konten, (4) mengirim buletin mingguan jika Anda berlangganan. Kami tidak menjual data Anda ke pihak ketiga."],
  ["Data Anak", "Data anak hanya terlihat oleh pemilik akun. Kami tidak membuat profil periklanan anak dan tidak membagikan data anak ke pengiklan. Anda dapat menghapus profil anak kapan pun dari halaman Profil."],
  ["Cookie & Penyimpanan Lokal", "Kami memakai localStorage untuk sesi login dan progres learning path. Tidak ada cookie pelacakan pihak ketiga. Embed video YouTube dapat memasang cookie milik YouTube setelah Anda memutar video."],
  ["Keamanan", "Password di-hash dengan bcrypt. Koneksi production selalu HTTPS. Akses internal dibatasi berbasis peran (ADMIN/EDITOR) dengan audit log."],
  ["Hak Anda", "Anda berhak mengakses, mengoreksi, atau menghapus seluruh data Anda (termasuk akun) kapan pun. Email hak@mentari.id dan kami proses maksimal 14 hari kerja."],
  ["Perubahan Kebijakan", "Perubahan material akan diumumkan via notifikasi in-app minimal 14 hari sebelum berlaku. Versi ini berlaku sejak 1 November 2026."],
];

export default function KebijakanPrivasiPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Legal</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-secondary">Kebijakan Privasi</h1>
      <p className="mt-2 text-sm text-muted">Versi 1.1 · berlaku 1 November 2026</p>
      {SECTIONS.map(([title, body]) => (
        <section key={title} className="mt-8">
          <h2 className="font-heading text-lg font-extrabold text-secondary">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-ink/85">{body}</p>
        </section>
      ))}
    </article>
  );
}

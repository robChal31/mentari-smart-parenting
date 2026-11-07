import type { Metadata } from "next";

export const metadata: Metadata = { title: "Syarat & Ketentuan" };

const SECTIONS: Array<[string, string]> = [
  ["Penerimaan Syarat", "Dengan membuat akun atau menggunakan MentariSmartParent, Anda menyetujui syarat ini dan Kebijakan Privasi kami. Jika tidak setuju, mohon tidak menggunakan layanan."],
  ["Layanan & Akurasi Konten", "Konten kami disusun oleh tenaga ahli berlisensi dan diperbarui berkala, namun bersifat edukatif — bukan pengganti diagnosis, konsultasi, atau resep dokter. Untuk kondisi medis, selalu konsultasikan dengan dokter anak Anda."],
  ["Akun Anda", "Anda bertanggung jawab menjaga kerahasiaan password. Satu akun untuk satu keluarga. Penyalahgunaan (spam, ujaran kebencian, konten tidak pantas di komunitas) dapat berujung suspensi."],
  ["Komunitas", "Berlaku etika: saling menghormati, tanpa body-shaming, tanpa klaim medis ekstrem. Moderator berhak menghapus konten dan memblokir akun yang melanggar."],
  ["Produk & Afiliasi", "Rekomendasi produk Mentari Group bersifat editorial dan diberi label. Pembelian dilakukan di properti Mentari Group; transaksi tunduk pada syarat Mentari Group. Kami dapat menerima komisi affiliate tanpa mengubah harga Anda."],
  ["Kekayaan Intelektual", "Seluruh konten (teks, ilustrasi, kurikulum) adalah milik MentariSmartParent/Mentari Group. Boleh dibagikan dengan atribusi; tidak boleh dicetak ulang untuk tujuan komersial tanpa izin tertulis."],
  ["Batas Tanggung Jawab", "Layanan disediakan 'sebagaimana adanya'. Kami tidak bertanggung jawab atas keputusan medis/pengasuhan yang diambil semata berdasarkan konten, maupun gangguan layanan di luar kendali kami."],
  ["Perubahan & Kontak", "Syarat ini dapat diperbarui dengan pengumuman in-app. Pertanyaan: halo@mentari.id. Versi 1.1 berlaku 1 November 2026."],
];

export default function SyaratKetentuanPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">Legal</p>
      <h1 className="mt-2 font-heading text-3xl font-extrabold text-secondary">Syarat & Ketentuan</h1>
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

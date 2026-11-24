import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, BookOpenText, Flame, Heart, Lightbulb, MessagesSquare,
  NotebookPen, Play, Rocket, ShieldCheck, Sparkle, UserRoundCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ThumbImg } from "@/components/thumb-img";
import { formatRelativeTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

/**
 * Ilustrasi + warna untuk tiap fase usia.
 *
 * Dipetakan lewat SLUG, bukan urutan array: `ageGroups` datang dari API dan
 * urutannya bisa berubah kalau admin menambah atau menyusun ulang fase.
 * Memakai index berarti gambar bayi bisa muncul di pil SD Akhir tanpa ada
 * yang sadar. Fallback dipakai untuk fase yang belum punya ilustrasi.
 *
 * Keenam figur digambar sekali dengan gaya seragam (outline tebal, palet
 * hangat) lalu dipotong latarnya, jadi bisa duduk di atas warna pil apa pun
 * tanpa kotak putih di sekelilingnya.
 */
const AGE_STAGE_STYLE: Record<string, { art?: string; bg: string; fg: string }> = {
  bayi:        { art: "/images/stage-baby.webp",      bg: "bg-[#EBB666]", fg: "text-secondary" },
  batita:      { art: "/images/stage-toddler.webp",   bg: "bg-[#C14E22]", fg: "text-cream" },
  prasekolah:  { art: "/images/stage-preschool.webp", bg: "bg-[#A3C377]", fg: "text-secondary" },
  "sd-awal":   { art: "/images/stage-school.webp",    bg: "bg-accent",    fg: "text-cream" },
  "sd-akhir":  { art: "/images/stage-sd-akhir-v2.webp",  bg: "bg-[#8FA9C4]", fg: "text-secondary-deep" },
  // "Semua Usia" bukan satu anak, jadi ilustrasinya satu keluarga utuh —
  // itu yang membedakannya dari lima pil fase di sebelahnya.
  "semua-usia":{ art: "/images/stage-semua-usia-v2.webp", bg: "bg-cream", fg: "text-secondary" },
};
const AGE_STAGE_FALLBACK = { bg: "bg-sand", fg: "text-secondary" };

/**
 * Label + ikon tipe konten.
 *
 * Section "Konten Pilihan" mencampur artikel, video, dan infografis. Tanpa
 * label tipe, pengunjung tidak tahu apakah tautan akan membuka bacaan atau
 * pemutar video — dan judul section lama ("bahan bacaan") jadi menyesatkan.
 */
// `icon` sengaja disimpan sebagai elemen, bukan komponen: ukurannya selalu
// 10px dan tidak pernah berubah, jadi tidak perlu render ulang per pemakaian.
type TypeBadge = { icon: ReactNode; key: keyof Awaited<ReturnType<typeof getDictionary>>["dict"]["contentTypes"] };

const TYPE_BADGE: Record<string, TypeBadge> = {
  ARTICLE:     { icon: <BookOpenText size={10} />, key: "ARTICLE" },
  VIDEO:       { icon: <Play size={10} fill="currentColor" />, key: "VIDEO" },
  INFOGRAPHIC: { icon: <Sparkle size={10} />, key: "INFOGRAPHIC" },
  TIPS:        { icon: <Lightbulb size={10} />, key: "TIPS" },
  ACTIVITY:    { icon: <NotebookPen size={10} />, key: "ACTIVITY" },
};

// Gradient kartu besar. Diambil dari palet agar tidak menambah warna baru,
// dan urutannya sengaja tidak mengulang gradient thumbnail ContentCard.
const FEATURED_GRADIENTS = [
  "from-[#F2E1CD] via-[#EFD3B8] to-[#E2B26E]",
  "from-[#E3EADF] via-[#D3E0CC] to-[#A3C377]",
  "from-[#DEE9F0] via-[#C9DBE7] to-[#8FB4CE]",
];

/**
 * Tepi bergelombang untuk pita warna.
 *
 * Referensi memakai tepi bergelombang sinus, dan itu tidak bisa ditiru
 * dengan border-radius (radius elips maksimum 50% cuma melengkungkan
 * ujung, bukan sepanjang tepi). Jadi dipakai SVG path yang discalakan
 * lewat preserveAspectRatio="none": gelombangnya mengikuti lebar layar
 * apa pun tanpa distorsi yang terlihat.
 *
 * Path: 3 periode penuh di lebar 1200 unit, amplitudo 14 unit. Angka
 * ganjil (3) dipakai supaya gelombang tidak berakhir di tengah puncak —
 * kalau genap, tepi kiri dan kanan akan simetris dan terlihat seperti
 * pola cetak, bukan potongan kertas.
 */
function WaveEdge({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        d="M0,20 C100,4 200,4 300,20 C400,36 500,36 600,20 C700,4 800,4 900,20 C1000,36 1100,36 1200,20 L1200,40 L0,40 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function HomePage() {
  const { locale, dict } = await getDictionary();
  const [featured, latest, categories, ageGroups, products, learningPaths, threads] = await Promise.all([
    api.contentsFeatured(4),
    api.contents({ sort: "latest", limit: "4" }),
    api.categories(),
    api.ageGroups(),
    api.products({ featured: "true" }),
    api.learningPaths(),
    api.threads({ limit: "3" }),
  ]);

  const featuredItems = featured ?? [];
  const latestItems = latest.items;
  const flatCategories = (categories ?? []).flatMap((c) => [c, ...(c.children ?? [])]).slice(0, 12);

  return (
    <>
      {/* ============ HERO ============ */}
      {/* Banner lebar, mengikuti referensi: satu panel horizontal dengan
          foto memenuhi seluruh bidang, teks menimpa di kiri, dan satu
          catatan tempel kecil di kanan.

          Dua hal yang membedakannya dari versi sebelumnya:
          1. Rasionya lebar (bukan dua kolom tinggi). Referensinya memang
             banner, jadi foto dibentang penuh dan tingginya dibatasi.
          2. Teksnya berada DI ATAS foto, bukan di kolom sendiri. Kolom
             kiri foto sengaja dibuat kosong saat foto digenerate, jadi
             area teks tetap bersih tanpa perlu selubung pekat.

          Kartu milestone & streak dihapus: di referensi tidak ada, dan
          keduanya memang tidak menambah informasi apa pun di banner. */}
      <section className="relative">
        {/* Lebar hero disamakan dengan navbar dan section lain: kontainer
            max-w-7xl + padding yang sama. Sebelumnya banner ini
            full-bleed, jadi tepinya lebih lebar daripada navbar dan
            seluruh isi halaman — terlihat seperti elemen yang lepas dari
            grid, bukan bagian dari halaman. */}
        <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-b-[1.5rem] bg-cream sm:rounded-b-[2rem] lg:min-h-[26rem]">

          {/* Foto: di layar kecil berdiri sendiri sebagai band di atas
              teks, karena foto 3:1 kalau dipaksa mengisi kotak tinggi
              hanya menyisakan potongan sempit. Di layar lebar baru foto
              ini jadi latar penuh dengan teks menimpanya. */}
          {/* Foto hero di mobile dulu 224px — cukup kecil sehingga wajah
              keluarga terpotong di bagian atas. 248px memberi ruang lebih
              lega tanpa mendorong teks terlalu jauh ke bawah. */}
          <div className="relative h-64 w-full sm:h-72 lg:absolute lg:inset-0 lg:h-full">
            <Image
              src="/images/hero-banner.webp"
              alt={dict.home.heroAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[62%_center]"
            />
            {/* Selubung hanya di layar lebar, tempat teks menimpa foto.
                Di layar kecil foto dan teks tidak bertumpuk, jadi tidak
                perlu penjaga kontras. */}
            <div
              aria-hidden
              className="absolute inset-0 hidden bg-linear-to-r from-cream via-cream/85 to-cream/10 lg:block lg:via-cream/70 lg:to-transparent"
            />
          </div>

          <div className="relative mx-auto flex max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[27rem] lg:py-14">
            <div className="fade-up max-w-xl lg:max-w-[34rem]">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary-deep sm:tracking-[0.22em]">
                {dict.home.heroBadge2}
              </p>
              {/* Di layar 390px judul ini memakan 5 baris dan mendorong
                  CTA hampir keluar layar. Ukurannya diturunkan sedikit di
                  mobile saja; dari sm ke atas kembali besar. */}
              {/* Ukuran mobile dipilih dari pengukuran di 320/360/390/412/430,
                  bukan kira-kira. 7vw (dibatasi 20.8–27.2px) selalu
                  menghasilkan 4 baris; di 360px dan 390px baris terakhirnya
                  utuh "Tumbuh Kembang Anak". Ukuran tetap 27.2px membuat
                  kata "Anak" tertinggal sendirian di 360px. Di 320px dan
                  412px baris terakhir memang lebih pendek, itu wajar. */}
              <h1
                className="mt-3 font-heading text-[clamp(1.3rem,7vw,1.7rem)] font-extrabold leading-[1.16] tracking-tight text-secondary sm:text-[2.5rem] sm:leading-[1.08] lg:text-[2.9rem]"
                style={{ textWrap: "balance" }}
              >
                {dict.home.heroTitleA}{" "}
                <span className="text-primary">{dict.home.heroTitleB}{" "}</span>
                <span className="relative inline-block">
                  {dict.home.heroTitleC}
                  {/* garis coretan hangat di bawah kata kunci */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-2 -rotate-[0.6deg] rounded-[40%_60%_50%_50%/60%_40%_60%_40%] bg-primary/30 sm:h-2.5"
                  />
                </span>
              </h1>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-[1.6] text-ink/75 sm:text-base sm:leading-7">
                {dict.home.heroSub}
              </p>
              <div className="mt-6">
                <Link
                  href="/contents"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 font-heading text-[0.9375rem] font-bold text-white shadow-[0_10px_24px_rgba(193,78,34,0.28)] transition hover:bg-primary-deep sm:min-h-0 sm:text-sm"
                >
                  {dict.home.ctaExplore} <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {/* Catatan tempel di kanan — pengganti kartu mengambang yang
              dihapus. Miring sedikit supaya terasa ditempel, bukan
              komponen UI. Hanya di layar lebar; di layar kecil ia akan
              menutupi foto. */}
          <div className="pointer-events-none absolute right-6 top-10 hidden w-[13.5rem] rotate-[4deg] rounded-[1.1rem] bg-[#F6E7C6] px-4 py-5 shadow-[0_14px_30px_rgba(42,38,32,0.16)] lg:block">
            <Heart size={20} className="mx-auto text-primary" fill="currentColor" aria-hidden />
            <p className="mt-2 text-center font-heading text-[0.95rem] font-extrabold leading-snug text-secondary">
              {dict.home.heroNoteTitle}
            </p>
            <span
              aria-hidden
              className="mx-auto mt-2 block h-1.5 w-14 -rotate-2 rounded-full bg-primary/45"
            />
          </div>
        </div>
        </div>
      </section>

      {/* ============ BAND FASE USIA ============ */}
      {/* Referensi memakai pil yang memuat ilustrasi anak, bukan ikon garis.
          Figurnya setengah keluar dari tepi pil, jadi bentuknya terasa
          seperti stiker yang ditempel, bukan avatar di dalam lingkaran. */}
      {ageGroups && ageGroups.length > 0 && (
        <section aria-label={dict.home.ageRailAria} className="relative mt-12">
          {/* Tepi atas gelombang: warna sand naik ke latar cream. */}
          <WaveEdge className="block h-5 w-full text-sand sm:h-7" />
          <div className="bg-sand pb-2 pt-2">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="font-heading text-xl font-extrabold tracking-tight text-secondary sm:text-2xl">
                {dict.home.ageRailLabel}
              </h2>
            </div>
          </div>
          <div className="relative bg-sand pb-1">
            {/* pr-6 + elemen penutup 12px (.chip-rail::after). Dengan
                begitu pil terakhir tidak menempel di tepi layar saat
                digulir sampai ujung, dan pembaca melihat masih ada isi. */}
            <div className="chip-rail mx-auto flex max-w-7xl items-center gap-2.5 overflow-x-auto px-4 pb-3 pt-5 sm:gap-4 sm:px-6">
              {/* API mengurutkan berdasarkan min_age, dan "Semua Usia" punya
                  min_age 0 — jadi ia menyelip di antara Bayi dan Batita.
                  Di sini urutannya diperbaiki: fase berurutan dari bayi,
                  "Semua Usia" ditaruh paling akhir karena ia bukan fase
                  melainkan pintasan. */}
              {[...ageGroups]
                .sort((a, b) => {
                  const rank = (g: { slug: string }) => (g.slug === "semua-usia" ? 1 : 0);
                  return rank(a) - rank(b) || a.minAge - b.minAge;
                })
                .map((group) => {
                const stage = AGE_STAGE_STYLE[group.slug] ?? AGE_STAGE_FALLBACK;
                return (
                  <Link
                    key={group.id}
                    href={`/contents?ageGroup=${group.slug}`}
                    className={`group relative inline-flex shrink-0 items-center whitespace-nowrap rounded-full ${stage.bg} ${stage.fg} py-2 pl-2.5 pr-4 text-[0.8125rem] font-extrabold shadow-[0_4px_14px_rgba(42,38,32,0.12)] ring-2 ring-white/40 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(42,38,32,0.20)] sm:py-2.5 sm:pl-3 sm:pr-6 sm:text-sm`}
                  >
                    {stage.art ? (
                      // Ilustrasi sudah dipotong latarnya. Diberi tinggi tetap
                      // dan sedikit keluar dari pil supaya terasa tiga dimensi.
                      <Image
                        src={stage.art}
                        alt=""
                        width={120}
                        height={200}
                        aria-hidden
                        className="mr-1.5 h-9 w-auto shrink-0 -translate-y-0.5 transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-105 sm:mr-2 sm:h-12 sm:-translate-y-1 sm:group-hover:-translate-y-2"
                      />
                    ) : (
                      // Fase tanpa ilustrasi: pakai inisial supaya lebarnya
                      // tetap sebanding, tidak mendadak gepeng.
                      <span
                        aria-hidden
                        className="mr-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/35 font-heading text-[11px] font-extrabold sm:h-10 sm:w-10 sm:text-xs"
                      >
                        {group.name.charAt(0)}
                      </span>
                    )}
                    {group.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Tepi bawah gelombang: fase dibalik supaya puncaknya
              tidak sejajar dengan tepi atas. */}
          <WaveEdge className="block h-5 w-full text-sand sm:h-7" flip />
        </section>
      )}

      {/* ============ KONTEN PILIHAN ============ */}
      {/* Susunannya mengikuti referensi: satu kartu besar di kiri, tiga
          baris di kanan. Tiga hal yang membuatnya terasa satu komposisi,
          bukan dua kolom yang kebetulan bersebelahan:

          1. Latarnya polos. Versi sebelumnya memakai panel sand
             bergelombang, dan justru panel itu yang memisahkan section
             ini dari halaman. Di referensi, section-nya duduk langsung
             di latar krem tanpa pembatas apa pun.
          2. Kartu besar memakai bingkai putih tebal seperti foto
             polaroid, dengan sudut membulat besar.
          3. Baris di kanan TIDAK berkotak. Pemisahnya garis tipis,
             dan angkanya besar di ujung kanan — bukan badge.

          Nomornya dimulai dari 01 untuk kartu besar, dan baris pertama
          di kanan juga 01: kolom kanan adalah daftar tersendiri, bukan
          lanjutan penomoran kartu besar. */}

      {featuredItems.length > 0 && (
        <section className="mt-14 sm:mt-16" aria-labelledby="favorites-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">

            {/* ---- kepala section ---- */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <h2
                id="favorites-heading"
                className="flex items-center gap-2 font-heading text-[1.5rem] font-extrabold leading-tight tracking-tight text-secondary sm:text-[2.1rem]"
              >
                {dict.home.favoritesTitle}
                <Sparkle size={20} className="shrink-0 text-primary" fill="currentColor" aria-hidden />
              </h2>
              <Link
                href="/contents?sort=popular"
                className="-my-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 py-2 text-xs font-bold text-primary transition hover:gap-2.5 hover:text-primary-deep sm:text-sm"
              >
                {dict.home.viewAll} <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
            <p className="mt-1.5 text-[0.8125rem] leading-[1.35rem] text-muted sm:text-sm sm:leading-5">
              {dict.home.favoritesSub}
            </p>

            <div className="mt-6 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,1fr)]">

              {/* --- kartu besar --- */}
              {(() => {
                const hero = featuredItems[0];
                const heroCategory = hero.categories[0];
                return (
                  <Link
                    href={`/contents/${hero.slug}`}
                    className="group relative block h-full rounded-[1.9rem] bg-white p-2 shadow-[0_18px_44px_rgba(42,38,32,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(42,38,32,0.22)] sm:rounded-[2.2rem] sm:p-2.5"
                  >
                    {/* Bingkai putih di sekeliling foto. Padding pada
                        pembungkus + overflow-hidden pada anaknya, bukan
                        border — supaya sudut foto ikut membulat rapi. */}
                    {/* Di mobile kartu ini dulu 304px. Dengan thumbnails kecil
                        di daftar bawahnya, 240px sudah cukup gagah dan
                        membuat section ini tidak terlalu mendominasi. */}
                    <div className="relative flex min-h-[15rem] flex-1 flex-col justify-end overflow-hidden rounded-[1.5rem] bg-secondary sm:min-h-[24rem] sm:rounded-[1.75rem]">
                      <div className={`absolute inset-0 bg-linear-to-br ${FEATURED_GRADIENTS[0]}`} />
                      {hero.thumbnailUrl && (
                        <ThumbImg src={hero.thumbnailUrl} className="absolute inset-0 h-full w-full object-cover" />
                      )}
                      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-secondary-deep/90 via-secondary-deep/45 to-transparent" />

                      {/* label tipe di kiri atas, pil kecil putih */}
                      <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow sm:min-h-0 sm:text-[10px]">
                          <Flame size={11} fill="currentColor" aria-hidden /> {dict.home.popularToggle}
                        </span>
                        <span className="inline-flex min-h-6 items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-secondary backdrop-blur sm:min-h-0 sm:text-[10px]">
                          {TYPE_BADGE[hero.type]?.icon}
                          {dict.contentTypes[TYPE_BADGE[hero.type]?.key ?? "ARTICLE"] ?? hero.type}
                        </span>
                      </div>

                      {/* Judul menimpa foto. Kategori jadi pil oranye
                          tepat di atas judul, seperti di referensi. */}
                      <div className="relative p-4 sm:p-6">
                        {heroCategory && (
                          <span className="mb-2.5 inline-flex min-h-6 items-center rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.09em] text-white sm:text-[10px] sm:tracking-[0.1em]">
                            {heroCategory.name}
                          </span>
                        )}
                        <h3 className="font-heading text-[1.15rem] font-extrabold leading-snug text-white sm:text-[1.6rem]">
                          {hero.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })()}

              {/* --- daftar kanan: tanpa kotak, dipisah garis tipis --- */}
              <ol className="divide-y divide-sand/80">
                {featuredItems.slice(1, 4).map((item, index) => {
                  const category = item.categories[0];
                  const badge = TYPE_BADGE[item.type];
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/contents/${item.slug}`}
                        className="group flex items-center gap-3.5 py-4 sm:gap-5"
                      >
                        {/* Thumbnail kecil membulat. Sebelumnya disembunyikan
                            di mobile ("hidden ... sm:block"), jadi daftar ini
                            jadi tiga baris teks polos tanpa gambar sama
                            sekali. Sekarang tampil di semua ukuran dengan
                            proporsi 4:3 yang lebih besar di mobile. */}
                        <span className={`relative h-[4.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-2xl bg-linear-to-br sm:h-[4.6rem] sm:w-[5.6rem] ${FEATURED_GRADIENTS[(index + 1) % FEATURED_GRADIENTS.length]}`}>
                          {item.thumbnailUrl && (
                            <ThumbImg src={item.thumbnailUrl} className="h-full w-full object-cover" />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-extrabold uppercase tracking-[0.06em] sm:text-[10px] sm:tracking-[0.1em]">
                            {badge && (
                              <span className="inline-flex items-center gap-1 text-secondary/60">
                                {badge.icon}
                                {dict.contentTypes[badge.key] ?? item.type}
                              </span>
                            )}
                            {category && (
                              <span className="inline-flex min-h-6 items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-primary-deep sm:min-h-0 sm:px-2">
                                {category.name}
                              </span>
                            )}
                          </span>
                          <span className="block font-heading text-[0.9375rem] font-bold leading-snug text-secondary transition group-hover:text-primary-deep sm:text-base">
                            {item.title}
                          </span>
                          {item.excerpt && (
                            <span className="mt-1 line-clamp-2 block text-[0.75rem] leading-[1.15rem] text-muted sm:text-[11px] sm:leading-4">
                              {item.excerpt}
                            </span>
                          )}
                        </span>

                        {/* Angka besar di ujung kanan. Mulai dari 01
                            karena kolom ini daftar tersendiri. Warnanya
                            dibuat bergantian supaya tidak monoton. */}
                        <span
                          aria-hidden
                          className={`shrink-0 font-heading text-[1.4rem] font-extrabold leading-none transition sm:text-[2.15rem] ${
                            index % 2 === 0 ? "text-[#C88A3E]" : "text-primary/70"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>

            <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted/70 sm:tracking-[0.14em]">
              {dict.home.favoritesTypeHint}
            </p>
          </div>
        </section>
      )}

      {/* ============ EKSPLORASI TOPIK POPULER ============ */}
      {/* Referensi menyusun topik sebagai awan pil warna-warni dengan ukuran
          dan posisi tidak seragam — bukan baris chip rapi. Variasinya
          ditentukan dari hash slug, jadi stabil antar-render (tidak
          berkedip saat revalidate) tetapi tetap terasa acak. */}
      {flatCategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6" aria-labelledby="topik-heading">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <div className="shrink-0 lg:max-w-[15rem]">
              <h2 id="topik-heading" className="font-heading text-[1.375rem] font-extrabold leading-tight tracking-tight text-secondary sm:text-[1.75rem]">
                {dict.home.topicsTitleA}{" "}
                <span className="relative inline-block text-primary">
                  {dict.home.topicsTitleB}
                  <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-1.5 rounded-full bg-primary/20" />
                </span>
              </h2>
              <Link href="/contents" className="-my-2 mt-1 inline-flex min-h-11 items-center gap-1.5 py-2 text-sm font-bold text-primary transition hover:gap-2.5">
                {dict.home.viewAll} <ArrowRight size={14} aria-hidden />
              </Link>
            </div>

            <ul aria-label={dict.home.topicsAria} className="flex flex-wrap items-center gap-2 sm:gap-2.5 lg:gap-3">
              {flatCategories.slice(0, 8).map((category, index) => {
                // Rank menentukan warna; sisanya ditentukan hash supaya
                // urutannya tidak berpola.
                const palette = [
                  "bg-[#EBB666] text-secondary",
                  "bg-secondary text-cream",
                  "bg-primary text-white",
                  "bg-[#A3C377] text-secondary",
                  "bg-accent text-cream",
                  "bg-primary-soft text-primary-deep",
                  "bg-secondary-soft text-secondary",
                  "bg-sand text-secondary",
                ];
                let hash = 0;
                for (let i = 0; i < category.slug.length; i += 1) hash = (hash * 31 + category.slug.charCodeAt(i)) >>> 0;
                const tone = palette[(index + hash) % palette.length];
                // Ukuran bertingkat: beberapa topik sengaja lebih besar,
                // meniru awan kata di referensi.
                // Ukuran bertingkat (efek awan kata). Di mobile selisihnya
                // dibuat tipis supaya tidak terkesan berantakan, dan semua
                // pil minimal 36px tinggi agar nyaman disentuh jari.
                const size =
                  hash % 3 === 0
                    ? "text-[0.8125rem] sm:text-base px-4 py-2 sm:px-5 sm:py-2.5"
                    : "text-xs sm:text-sm px-3.5 py-2";
                return (
                  <li key={category.id}>
                    <Link
                      href={`/contents?category=${category.slug}`}
                      className={`inline-flex min-h-9 items-center rounded-full font-extrabold shadow-[0_2px_8px_rgba(42,38,32,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(42,38,32,0.16)] sm:min-h-0 ${tone} ${size}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ============ LEARNING PATHS ============ */}
      {learningPaths && learningPaths.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="paths-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-accent-deep">
                <Rocket size={13} aria-hidden /> {dict.home.pathsKicker}
              </p>
              <h2 id="paths-heading" className="mt-1 font-heading text-[1.375rem] font-extrabold text-secondary sm:text-2xl">{dict.home.pathsTitle}</h2>
            </div>
            <Link href="/learning-paths" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
              {dict.home.allPaths} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {learningPaths.map((path) => (
              <Link
                key={path.id}
                href={`/learning-paths/${path.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-secondary p-5 text-white transition hover:bg-secondary-deep sm:p-6"
              >
                <div aria-hidden className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent-bright/20 blur-2xl transition group-hover:bg-accent-bright/30" />
                <p className="text-[11px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent-on-dark sm:tracking-[0.18em]">{path.difficulty} · {path.estimatedTime} {dict.home.minutes}</p>
                <h3 className="mt-2 font-heading text-[1.125rem] font-extrabold leading-snug sm:text-xl">{path.title}</h3>
                {path.description && <p className="mt-2 line-clamp-2 max-w-md text-[0.8125rem] leading-[1.35rem] text-white/75 sm:text-sm sm:leading-6">{path.description}</p>}
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-accent-on-dark">
                  {dict.home.startThisPath} <ArrowRight size={13} className="transition group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ ARTIKEL TERBARU ============ */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="latest-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-secondary">
              <BookOpenText size={13} aria-hidden /> {dict.home.latestKicker}
            </p>
            <h2 id="latest-heading" className="mt-1 font-heading text-[1.375rem] font-extrabold text-secondary sm:text-2xl">{dict.home.latestTitle}</h2>
          </div>
          <Link href="/contents?sort=latest" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
            {dict.home.viewAll} <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latestItems.map((content) => <ContentCard key={content.id} content={content} />)}
        </div>
      </section>

      {/* ============ PRODUK MENTARI ============ */}
      {products && products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
          <RecommendationsPanel
            products={products.slice(0, 4)}
            source="BANNER"
            subtitle={dict.recommendations.subtitleHome}
            compact
          />
        </section>
      )}

      {/* ============ KOMUNITAS ============ */}
      {threads.items.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6" aria-labelledby="komunitas-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-primary">
                <MessagesSquare size={13} aria-hidden /> {dict.home.communityKicker}
              </p>
              <h2 id="komunitas-heading" className="mt-1 font-heading text-[1.375rem] font-extrabold text-secondary sm:text-2xl">{dict.home.communityTitle}</h2>
            </div>
            <Link href="/community" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2 sm:inline-flex">
              {dict.home.joinDiscussion} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {threads.items.map((thread) => (
              <Link
                key={thread.id}
                href={`/community/${thread.id}`}
                className="flex h-full flex-col surface surface-link p-4 sm:p-5"
              >
                {thread.isPinned && (
                  <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-warning">
                    📌 {dict.home.pinned}
                  </span>
                )}
                <h3 className="line-clamp-2 text-[0.9375rem] font-bold leading-snug text-ink sm:text-sm">{thread.title}</h3>
                <p className="mt-auto pt-3 text-[11px] font-medium text-muted sm:text-[10px]">
                  {thread.author.fullName} · {formatRelativeTime(thread.createdAt, locale, dict.time)} · {thread.commentCount} {dict.home.comments}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ PITA CTA ============ */}
      {/* Referensi memakai pita terracotta bergelombang yang menembus
          tepi layar — bukan kartu rounded di dalam container. */}
      <section className="mt-16">
        <WaveEdge className="block h-6 w-full text-primary sm:h-9" />
        <div className="bg-primary py-10 text-center text-white sm:py-14">
          <div className="mx-auto max-w-3xl px-5 sm:px-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/95 sm:tracking-[0.18em]">
              <ShieldCheck size={13} aria-hidden /> {dict.home.finalNote}
            </p>
            <h2 className="mt-4 font-heading text-[1.375rem] font-extrabold leading-tight sm:text-[2rem]">
              {dict.home.finalTitle}
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-[0.875rem] leading-[1.5rem] text-white/85 sm:text-sm sm:leading-6">
              {dict.home.finalSub}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-cream px-7 py-3.5 font-heading text-sm font-extrabold text-primary-deep shadow-[0_6px_20px_rgba(42,38,32,0.18)] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <UserRoundCheck size={17} aria-hidden /> {dict.home.finalCta}
              </Link>
              <Link
                href="/contents"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/55 px-7 py-3.5 font-heading text-sm font-extrabold text-white transition hover:bg-white/10"
              >
                {dict.home.finalBrowse} <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
        <WaveEdge className="block h-6 w-full text-primary sm:h-9" flip />
      </section>
    </>
  );
}

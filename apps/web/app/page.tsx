import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Baby, Backpack, BadgeCheck, BookOpenText, Flame, Footprints,
  MessagesSquare, Puzzle, Rocket, ShieldCheck, Sun, UserRoundCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { ContentCard } from "@/components/content-card";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ThumbImg } from "@/components/thumb-img";
import { formatRelativeTime } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

// Label yang mengikuti busur tepi foto hero. Karakter disebar di busur oleh
// CSS (.curved-label); spasi tetap dihitung supaya jaraknya rata.
const CURVED_LABEL = "TIM AHLI MENTARI";

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
      <section className="relative overflow-hidden border-b border-sand bg-gradient-to-b from-primary-soft/40 via-cream to-cream">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-bright/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
          <div className="fade-up">
            {/* <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent-deep">
              <Stethoscope size={13} aria-hidden /> {dict.home.heroBadge}
            </p> */}
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-deep">
              <Sun size={13} aria-hidden /> {dict.home.heroBadge2}
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-secondary sm:text-5xl xl:text-[3.6rem]">
              {dict.home.heroTitleA}{" "}
              <span className="relative inline-block text-primary">
                {dict.home.heroTitleB}
                {/* garis coretan hangat di bawah kata kunci, seperti referensi */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 h-2.5 -rotate-[0.6deg] rounded-[40%_60%_50%_50%/60%_40%_60%_40%] bg-primary/25 sm:h-3"
                />
              </span>
              {dict.home.heroTitleC}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              {dict.home.heroSub}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/contents"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-heading text-sm font-bold text-white transition hover:bg-primary-deep"
              >
                {dict.home.ctaExplore} <ArrowRight size={17} aria-hidden />
              </Link>
              <Link
                href="/learning-paths"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-secondary/15 bg-white px-6 py-3.5 font-heading text-sm font-bold text-secondary transition hover:border-secondary/35 hover:bg-secondary-soft"
              >
                <Rocket size={17} aria-hidden /> {dict.home.ctaPath}
              </Link>
            </div>
            <dl className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-secondary">
              <div>
                <dt className="sr-only">{dict.home.statSrContents}</dt>
                <dd className="font-heading text-2xl font-extrabold">250+</dd>
                <dd className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dict.home.statContents}</dd>
              </div>
              <div>
                <dt className="sr-only">{dict.home.statSrMilestones}</dt>
                <dd className="font-heading text-2xl font-extrabold">23</dd>
                <dd className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dict.home.statMilestones}</dd>
              </div>
              <div>
                <dt className="sr-only">{dict.home.statSrFree}</dt>
                <dd className="font-heading text-2xl font-extrabold">100%</dd>
                <dd className="text-[11px] font-semibold uppercase tracking-wide text-muted">{dict.home.statFree}</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            {/* Label busur di tepi atas foto. Tiap huruf diputar pada
                titik pusat lingkaran yang jauh di bawahnya, lalu ditarik
                keluar sepanjang jari-jari. Dengan begitu lengkungnya
                mengikuti bentuk tepi blob. Busur 80° + radius 8.2rem
                menaruh seluruh huruf di atas tepi foto (ujung busur -1px,
                tengah -31px), jadi tidak ada huruf yang tertimpa foto. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-3 left-1/2 h-56 w-56 -translate-x-1/2 sm:-top-4"
            >
              {CURVED_LABEL.split("").map((char, i) => {
                const total = CURVED_LABEL.length;
                const spread = 80;
                const angle = -spread / 2 + (i / (total - 1)) * spread;
                return (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 font-heading text-[0.7rem] font-extrabold uppercase tracking-[0.06em] text-primary-deep transition-transform"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-8.2rem)`,
                      opacity: char === " " ? 0 : 1,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                );
              })}
            </div>

            {/* Foto: mask blob asimetris, seperti potongan kertas di referensi.
                Bingkai putih dibuat sebagai padding pada pembungkus dan blob
                diterapkan pada anaknya — bukan ring-* (box-shadow), karena
                box-shadow tidak ikut terpotong overflow-hidden sehingga
                akan tampak sebagai kotak di sekeliling blob. */}
            <div className="blob-frame bg-white p-[7px] shadow-[0_34px_80px_rgba(39,61,48,0.20)]">
              <div className="blob-frame relative overflow-hidden bg-sand">
                <Image
                  src="/images/hero-keluarga.webp"
                  alt={dict.home.heroAlt}
                  width={880}
                  height={880}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            {/* floating cards */}
            <div className="absolute -left-3 top-6 flex items-center gap-2 rounded-2xl border border-sand bg-white/95 px-3 py-2 shadow-[0_10px_30px_rgba(42,38,32,0.12)] backdrop-blur sm:-left-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent-deep">
                <BadgeCheck size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold text-secondary">{dict.home.milestoneCardTitle}</span>
                <span className="block text-[9px] font-medium text-muted">{dict.home.milestoneCardSub}</span>
              </span>
            </div>
            <div className="absolute -right-2 bottom-8 flex items-center gap-2 rounded-2xl border border-sand bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:-right-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <Flame size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold text-secondary">{dict.home.streakCardTitle}</span>
                <span className="block text-[9px] font-medium text-muted">{dict.home.streakCardSub}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BAND FASE USIA ============ */}
      {/* Di referensi, empat fase usia ini duduk di atas pita kertas
          bergelombang — bukan rail chip polos. Ikon per fase dipakai supaya
          tiap chip bisa dikenali tanpa harus membaca labelnya. */}
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
            <div className="chip-rail mx-auto flex max-w-7xl items-center gap-2.5 overflow-x-auto px-4 pb-2 pt-4 sm:gap-3 sm:px-6">
              {ageGroups.map((group, index) => {
                // Tiap fase punya warna + ikon sendiri, mengikuti referensi:
                // oranye, terracotta, hijau muda, biru tua.
                const stages = [
                  { bg: "bg-[#EBB666]", fg: "text-secondary", Icon: Baby },
                  { bg: "bg-[#C14E22]", fg: "text-cream", Icon: Footprints },
                  { bg: "bg-[#A3C377]", fg: "text-secondary", Icon: Puzzle },
                  { bg: "bg-accent", fg: "text-cream", Icon: Backpack },
                ];
                const stage = stages[index % stages.length];
                const Icon = stage.Icon;
                return (
                  <Link
                    key={group.id}
                    href={`/contents?ageGroup=${group.slug}`}
                    className={`group inline-flex shrink-0 items-center gap-2.5 rounded-full ${stage.bg} ${stage.fg} py-2.5 pl-3 pr-5 text-xs font-extrabold shadow-[0_3px_10px_rgba(42,38,32,0.10)] ring-2 ring-white/50 transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(42,38,32,0.18)]`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-white/85 text-secondary transition group-hover:scale-105">
                      <Icon size={15} aria-hidden />
                    </span>
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

      {/* ============ BAHAN BACAAN TERFAVORIT ============ */}
      {/* Referensi memakai komposisi asimetris: satu kartu besar di kiri
          (= peringkat 01) dan tiga artikel bernomor 02/03/04 di kanan.
          Nomor besar berwarna terracotta pucat itu yang membuat section ini
          terasa seperti daftar kurasi, bukan grid kartu biasa. */}
      {featuredItems.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6" aria-labelledby="favorites-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-sand pb-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
                {dict.home.favoritesKicker}
              </p>
              <h2 id="favorites-heading" className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-secondary sm:text-[1.75rem]">
                {dict.home.favoritesTitle}
              </h2>
            </div>
            <Link href="/contents?sort=popular" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary transition hover:gap-2">
              {dict.home.viewAll} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
            {/* --- kartu besar --- */}
            {(() => {
              const hero = featuredItems[0];
              const heroCategory = hero.categories[0];
              return (
                <Link
                  href={`/contents/${hero.slug}`}
                  className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.75rem] border border-sand bg-white shadow-[0_2px_12px_rgba(42,38,32,0.06)] transition hover:shadow-[var(--shadow-accent)] lg:min-h-[26rem]"
                >
                  {/* thumbnail: gradient yang sudah ada, tidak diubah */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${FEATURED_GRADIENTS[0]}`} />
                  {hero.thumbnailUrl && (
                    <ThumbImg src={hero.thumbnailUrl} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  {/* taburan cahaya lembut, bukan ornamen */}
                  <span aria-hidden className="absolute -left-10 -top-12 h-48 w-48 rounded-full bg-white/45 blur-3xl" />
                  <span aria-hidden className="absolute right-0 top-1/4 h-40 w-40 rounded-full bg-white/30 blur-3xl" />
                  {/* gradasi gelap di bawah supaya teks putih terbaca */}
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-secondary-deep/90 via-secondary-deep/45 to-transparent" />

                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
                    <Flame size={11} fill="currentColor" aria-hidden /> {dict.home.popularToggle}
                  </span>
                  {/* Kartu besar adalah peringkat 01 — nomornya diletakkan di
                      sudut kanan atas, sejajar dengan badge Populer di kiri. */}
                  <span
                    aria-hidden
                    className="absolute right-4 top-3 font-heading text-2xl font-extrabold leading-none text-white/45 sm:text-3xl"
                  >
                    01
                  </span>

                  <div className="relative p-5 sm:p-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {heroCategory && (
                        <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary-deep">
                          {heroCategory.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-extrabold leading-snug text-white sm:text-2xl">
                      {hero.title}
                    </h3>
                    {hero.excerpt && (
                      <p className="mt-2 line-clamp-2 max-w-md text-xs leading-5 text-white/80 sm:text-sm">
                        {hero.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })()}

            {/* --- daftar bernomor --- */}
            <ol className="flex flex-col gap-3">
              {featuredItems.slice(1, 4).map((item, index) => {
                const category = item.categories[0];
                return (
                  <li key={item.id}>
                    <Link
                      href={`/contents/${item.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-sand bg-white p-3 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-accent)] sm:gap-5 sm:p-4"
                    >
                      {/* thumbnail kecil */}
                      <span className={`relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:block ${FEATURED_GRADIENTS[(index + 1) % FEATURED_GRADIENTS.length]}`}>
                        {item.thumbnailUrl && (
                          <ThumbImg src={item.thumbnailUrl} className="h-full w-full object-cover" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em]">
                          {category && (
                            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-deep">
                              {category.name}
                            </span>
                          )}
                        </span>
                        <span className="block font-heading text-sm font-bold leading-snug text-ink transition group-hover:text-secondary sm:text-[0.95rem]">
                          {item.title}
                        </span>
                        {item.excerpt && (
                          <span className="mt-1 line-clamp-1 block text-[11px] leading-4 text-muted">
                            {item.excerpt}
                          </span>
                        )}
                      </span>

                      {/* nomor urut — besar, terracotta pucat */}
                      <span
                        aria-hidden
                        className="shrink-0 font-heading text-3xl font-extrabold leading-none text-primary/25 transition group-hover:text-primary/45 sm:text-[2.5rem]"
                      >
                        {String(index + 2).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
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
              <h2 id="topik-heading" className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-secondary sm:text-[1.75rem]">
                {dict.home.topicsTitleA}{" "}
                <span className="relative inline-block text-primary">
                  {dict.home.topicsTitleB}
                  <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-1.5 rounded-full bg-primary/20" />
                </span>
              </h2>
              <Link href="/contents" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary transition hover:gap-2.5">
                {dict.home.viewAll} <ArrowRight size={14} aria-hidden />
              </Link>
            </div>

            <ul aria-label={dict.home.topicsAria} className="flex flex-wrap items-center gap-2.5 lg:gap-3">
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
                const size = hash % 3 === 0 ? "text-sm sm:text-base px-5 py-2.5" : "text-xs sm:text-sm px-4 py-2";
                return (
                  <li key={category.id}>
                    <Link
                      href={`/contents?category=${category.slug}`}
                      className={`inline-flex items-center rounded-full font-extrabold shadow-[0_2px_8px_rgba(42,38,32,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(42,38,32,0.16)] ${tone} ${size}`}
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
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-deep">
                <Rocket size={13} aria-hidden /> {dict.home.pathsKicker}
              </p>
              <h2 id="paths-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.pathsTitle}</h2>
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
                className="group relative overflow-hidden rounded-3xl bg-secondary p-6 text-white transition hover:bg-secondary-deep"
              >
                <div aria-hidden className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-accent-bright/20 blur-2xl transition group-hover:bg-accent-bright/30" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-accent-on-dark">{path.difficulty} · {path.estimatedTime} {dict.home.minutes}</p>
                <h3 className="mt-2 font-heading text-xl font-extrabold leading-snug">{path.title}</h3>
                {path.description && <p className="mt-2 line-clamp-2 max-w-md text-sm leading-6 text-white/75">{path.description}</p>}
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
            <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-secondary">
              <BookOpenText size={13} aria-hidden /> {dict.home.latestKicker}
            </p>
            <h2 id="latest-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.latestTitle}</h2>
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
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
                <MessagesSquare size={13} aria-hidden /> {dict.home.communityKicker}
              </p>
              <h2 id="komunitas-heading" className="mt-1 font-heading text-2xl font-extrabold text-secondary">{dict.home.communityTitle}</h2>
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
                className="flex h-full flex-col surface surface-link p-5"
              >
                {thread.isPinned && (
                  <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-warning">
                    📌 {dict.home.pinned}
                  </span>
                )}
                <h3 className="line-clamp-2 text-sm font-bold leading-snug text-ink">{thread.title}</h3>
                <p className="mt-auto pt-3 text-[10px] font-medium text-muted">
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
        <div className="bg-primary py-12 text-center text-white sm:py-14">
          <div className="mx-auto max-w-3xl px-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/95">
              <ShieldCheck size={13} aria-hidden /> {dict.home.finalNote}
            </p>
            <h2 className="mt-4 font-heading text-2xl font-extrabold leading-tight sm:text-[2rem]">
              {dict.home.finalTitle}
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-sm leading-6 text-white/85">
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

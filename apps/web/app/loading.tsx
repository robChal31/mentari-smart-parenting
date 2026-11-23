import { ContentCardSkeleton } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state beranda.
 *
 * Meniru susunan HomePage.tsx: hero dua kolom (teks + gambar), rail chip usia,
 * lalu grid kartu konten 4 kolom. Versi sebelumnya hanya judul + grid kartu,
 * jadi begitu hero asli muncul seluruh halaman bergeser ke bawah.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div aria-busy="true" aria-label={dict.errors.loadingAria}>
      {/* ===== HERO ===== */}
      <section className="border-b border-sand bg-linear-to-b from-primary-soft/40 via-cream to-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-16">
          <div>
            {/* badge */}
            <div className="skeleton h-7 w-56 rounded-full" />
            {/* H1 4 baris */}
            <div className="mt-5 space-y-3">
              <div className="skeleton h-10 w-full max-w-md" />
              <div className="skeleton h-10 w-11/12 max-w-sm" />
              <div className="skeleton h-10 w-3/4 max-w-xs" />
            </div>
            {/* subjudul 2 baris */}
            <div className="mt-5 space-y-2">
              <div className="skeleton h-4 w-full max-w-lg" />
              <div className="skeleton h-4 w-2/3 max-w-sm" />
            </div>
            {/* 2 tombol */}
            <div className="mt-7 flex gap-3">
              <div className="skeleton h-12 w-44 rounded-2xl" />
              <div className="skeleton h-12 w-40 rounded-2xl" />
            </div>
            {/* 3 statistik */}
            <div className="mt-8 flex gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton h-7 w-16" />
                  <div className="skeleton h-2.5 w-20" />
                </div>
              ))}
            </div>
          </div>
          {/* gambar hero */}
          <div className="skeleton mx-auto aspect-square w-full max-w-[34rem] rounded-[2.75rem]" />
        </div>
      </section>

      {/* ===== RAIL USIA ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="flex items-center gap-2 overflow-hidden pb-2">
          <div className="skeleton h-6 w-24 shrink-0 rounded-full" />
          {[88, 72, 104, 96, 92, 80].map((w, i) => (
            <div key={i} className="skeleton h-8 shrink-0 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </section>

      {/* ===== TRENDING: judul + 4 kartu ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="mb-5 space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-7 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* ===== CHIP KATEGORI ===== */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
        <div className="skeleton h-6 w-40" />
        <div className="mt-4 flex flex-wrap gap-2">
          {[96, 120, 84, 140, 108, 92, 116, 100].map((w, i) => (
            <div key={i} className="skeleton h-10 rounded-2xl" style={{ width: w }} />
          ))}
        </div>
      </section>
    </div>
  );
}

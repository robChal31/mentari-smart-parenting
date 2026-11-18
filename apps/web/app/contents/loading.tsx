import { ContentCardSkeleton } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state /contents.
 *
 * Meniru ContentsPage: header (kicker, judul, subjudul), lalu grid dua kolom
 * `lg:grid-cols-[260px_1fr]` — panel filter di kiri, hasil di kanan dengan
 * baris "jumlah hasil + sort" dan grid kartu.
 *
 * Ini yang dimaksud "skeleton harusnya sama dengan pagenya": sebelumnya hanya
 * satu baris judul + grid kartu selebar halaman, tanpa panel filter, sehingga
 * layout melompat drastis saat halaman asli selesai dimuat.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      {/* ===== HEADER ===== */}
      <header className="mb-6">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton mt-2 h-9 w-72" />
        <div className="skeleton mt-2 h-4 w-full max-w-2xl" />
      </header>

      {/* ===== GRID: filter + hasil ===== */}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* --- panel filter (meniru ContentsFilter) --- */}
        <aside className="h-fit rounded-3xl border border-sand bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="skeleton-on-card h-5 w-36" />
            <div className="skeleton-on-card h-5 w-5 rounded-full" />
          </div>
          {/* kata kunci */}
          <div className="mt-4 space-y-1.5">
            <div className="skeleton-on-card h-2.5 w-20" />
            <div className="skeleton-on-card h-11 w-full rounded-2xl" />
          </div>
          {/* radio usia: 6 baris */}
          <div className="mt-4 space-y-1.5">
            <div className="skeleton-on-card h-2.5 w-20" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="skeleton-on-card h-4 w-4 rounded-full" />
                <div className="skeleton-on-card h-3 flex-1" />
              </div>
            ))}
          </div>
          {/* tipe konten + kategori */}
          {[0, 1].map((i) => (
            <div key={i} className="mt-4 space-y-1.5">
              <div className="skeleton-on-card h-2.5 w-24" />
              <div className="skeleton-on-card h-11 w-full rounded-2xl" />
            </div>
          ))}
          {/* tombol terapkan */}
          <div className="skeleton-on-card mt-5 h-12 w-full rounded-2xl" />
        </aside>

        {/* --- hasil --- */}
        <div>
          {/* baris jumlah + sort */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="skeleton h-4 w-32" />
            <div className="flex gap-1">
              <div className="skeleton h-8 w-24 rounded-full" />
              <div className="skeleton h-8 w-24 rounded-full" />
            </div>
          </div>
          {/* grid kartu */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

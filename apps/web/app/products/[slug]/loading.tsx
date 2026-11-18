import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state detail produk /products/[slug].
 *
 * Meniru ProductDetailPage: `max-w-5xl`, grid `md:grid-cols-[380px_1fr]` —
 * panel gambar produk di kiri, info (kategori, nama, harga, tombol) di kanan.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5">
        <div className="skeleton h-2.5 w-12" />
        <div className="skeleton h-2.5 w-2" />
        <div className="skeleton h-2.5 w-16" />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[380px_1fr]">
        {/* gambar produk */}
        <div className="skeleton-on-card aspect-square w-full rounded-3xl" />

        {/* info */}
        <div>
          <div className="skeleton-on-card h-2.5 w-24" />
          <div className="mt-2 space-y-2">
            <div className="skeleton-on-card h-8 w-full" />
            <div className="skeleton-on-card h-8 w-2/3" />
          </div>
          <div className="skeleton-on-card mt-4 h-7 w-32" />
          <div className="mt-5 space-y-2">
            {[100, 95, 88, 70].map((w, i) => (
              <div key={i} className="skeleton-on-card h-4" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="skeleton-on-card h-12 w-48 rounded-2xl" />
            <div className="skeleton-on-card h-12 w-36 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* rekomendasi produk lain */}
      <section className="mt-12 border-t border-sand pt-8">
        <div className="skeleton h-6 w-48" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-primary/12 bg-cream p-3">
              <div className="skeleton-on-card aspect-[4/3] w-full rounded-xl" />
              <div className="skeleton-on-card mt-2 h-3 w-full" />
              <div className="skeleton-on-card mt-1.5 h-3 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

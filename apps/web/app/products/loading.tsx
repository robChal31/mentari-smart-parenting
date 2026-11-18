import { ProductCardSkeleton } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state /products.
 *
 * Meniru ProductsPage: header (kicker + judul + subjudul), lalu per kelompok
 * tipe produk ada judul kecil dan grid kartu `2/3/4/5` kolom.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      <header className="max-w-2xl">
        <div className="skeleton h-3 w-36" />
        <div className="skeleton mt-2 h-9 w-64" />
        <div className="skeleton mt-3 h-7 w-52 rounded-full" />
        <div className="skeleton mt-3 h-4 w-full" />
        <div className="skeleton mt-1.5 h-4 w-4/5" />
      </header>

      {[0, 1].map((group) => (
        <section key={group} className="mt-10">
          <div className="skeleton h-6 w-44" />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

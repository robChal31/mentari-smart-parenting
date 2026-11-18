import { ContentCardSkeleton } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state /search.
 *
 * Meniru SearchPage: judul halaman, kotak pencarian besar (rounded-3xl,
 * border-2), lalu baris "N hasil" dan grid kartu 4 kolom.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      <div className="skeleton h-9 w-64" />

      {/* kotak pencarian */}
      <div className="skeleton mt-5 h-[68px] w-full max-w-2xl rounded-3xl" />

      <div className="mt-8">
        <div className="skeleton mb-4 h-4 w-40" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

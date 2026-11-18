import { ContentCardSkeleton, RecommendationsPanelSkeleton } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state detail artikel /contents/[slug].
 *
 * Meniru ContentDetailPage: breadcrumb, grid `lg:grid-cols-[minmax(0,1fr)_340px]`
 * (kolom artikel + sidebar rekomendasi), chip kategori, judul 2 baris, excerpt,
 * lalu blok paragraf bergaya prose. Di bawahnya bagian "Baca juga" 4 kartu.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      {/* breadcrumb */}
      <div className="flex items-center gap-1.5">
        <div className="skeleton h-2.5 w-12" />
        <div className="skeleton h-2.5 w-2" />
        <div className="skeleton h-2.5 w-16" />
        <div className="skeleton h-2.5 w-2" />
        <div className="skeleton h-2.5 w-20" />
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ===== kolom artikel ===== */}
        <div className="min-w-0">
          {/* chip kategori + usia */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          {/* judul 2 baris + excerpt 2 baris */}
          <div className="mt-4 space-y-3">
            <div className="skeleton h-9 w-full" />
            <div className="skeleton h-9 w-2/3" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="skeleton h-5 w-full" />
            <div className="skeleton h-5 w-4/5" />
          </div>
          {/* meta penulis + tanggal */}
          <div className="mt-5 flex items-center gap-3">
            <div className="skeleton h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <div className="skeleton h-3 w-32" />
              <div className="skeleton h-2.5 w-24" />
            </div>
          </div>
          {/* gambar sampul */}
          <div className="skeleton mt-6 aspect-[16/9] w-full rounded-3xl" />
          {/* isi artikel */}
          <div className="mt-6 space-y-3">
            {[100, 96, 88, 100, 72].map((w, i) => (
              <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
            ))}
            <div className="skeleton h-7 w-56 pt-2" />
            {[98, 92, 100, 84, 95, 66].map((w, i) => (
              <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>

        {/* ===== sidebar rekomendasi ===== */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <RecommendationsPanelSkeleton count={3} />
        </aside>
      </div>

      {/* ===== baca juga ===== */}
      <section className="mt-12 border-t border-sand pt-8">
        <div className="skeleton h-6 w-32" />
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

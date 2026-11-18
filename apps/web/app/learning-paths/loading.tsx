import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state /learning-paths.
 *
 * Meniru LearningPathsPage: hero berpola titik dengan badge, judul 2 baris, dan
 * subjudul, lalu grid 2 kolom kartu gelap (bg-secondary) berbentuk horizontal —
 * bukan grid kartu putih seperti beranda.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div aria-busy="true" aria-label={dict.errors.loadingAria}>
      {/* hero */}
      <section className="dot-grid border-b border-sand">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="skeleton h-7 w-48 rounded-full" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-11 w-full max-w-2xl" />
            <div className="skeleton h-11 w-3/5 max-w-md" />
          </div>
          <div className="mt-4 skeleton h-4 w-full max-w-xl" />
        </div>
      </section>

      {/* grid kartu jalur belajar (gelap, horizontal) */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex overflow-hidden rounded-3xl bg-secondary sm:flex-row">
              {/* panel gambar kiri (disembunyikan di layar kecil, sama seperti aslinya) */}
              <div className="relative hidden w-2/5 shrink-0 bg-secondary-deep/60 sm:block" />
              <div className="relative flex min-w-0 flex-1 flex-col p-6 sm:p-7">
                <div className="h-6 w-32 rounded-full bg-white/15" />
                <div className="mt-4 h-6 w-full rounded bg-white/20" />
                <div className="mt-2 h-6 w-3/4 rounded bg-white/20" />
                <div className="mt-3 h-3 w-full rounded bg-white/10" />
                <div className="mt-1.5 h-3 w-5/6 rounded bg-white/10" />
                <div className="mt-6 flex items-center justify-between pt-1">
                  <div className="h-7 w-28 rounded-full bg-white/15" />
                  <div className="h-4 w-16 rounded bg-white/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

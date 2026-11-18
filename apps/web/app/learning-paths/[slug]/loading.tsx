import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state detail jalur belajar /learning-paths/[slug].
 *
 * Meniru PathDetailPage: `max-w-4xl`, hero navy (bg-secondary) dengan badge,
 * judul, dan deskripsi, lalu daftar langkah bernomor di bawahnya.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      {/* hero navy */}
      <div className="rounded-[2rem] bg-secondary p-6 sm:p-8">
        <div className="h-6 w-36 rounded-full bg-white/15" />
        <div className="mt-3 space-y-2">
          <div className="h-9 w-full rounded bg-white/20" />
          <div className="h-9 w-2/3 rounded bg-white/20" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-3.5 w-full rounded bg-white/10" />
          <div className="h-3.5 w-4/5 rounded bg-white/10" />
        </div>
        <div className="mt-5 flex gap-3">
          <div className="h-7 w-28 rounded-full bg-white/15" />
          <div className="h-7 w-24 rounded-full bg-white/15" />
        </div>
      </div>

      {/* daftar langkah */}
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-2xl border border-sand bg-white p-4">
            <div className="skeleton-on-card h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton-on-card h-4 w-2/3" />
              <div className="skeleton-on-card h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

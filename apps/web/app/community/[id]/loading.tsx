import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state thread komunitas /community/[id].
 *
 * Meniru ThreadPage: `max-w-4xl`, satu kartu putih besar (rounded-[2rem])
 * berisi header penulis, judul thread, isi, dan area balasan.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      {/* tombol kembali */}
      <div className="skeleton h-4 w-28" />

      {/* kartu thread */}
      <article className="mt-5 rounded-[2rem] border border-sand bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="skeleton-on-card h-11 w-11 rounded-2xl" />
          <div className="space-y-1.5">
            <div className="skeleton-on-card h-3.5 w-32" />
            <div className="skeleton-on-card h-2.5 w-24" />
          </div>
        </div>
        <div className="skeleton-on-card mt-4 h-7 w-full" />
        <div className="skeleton-on-card mt-1.5 h-7 w-1/2" />
        <div className="mt-4 space-y-2">
          {[100, 96, 88, 92, 60].map((w, i) => (
            <div key={i} className="skeleton-on-card h-3.5" style={{ width: `${w}%` }} />
          ))}
        </div>
      </article>

      {/* balasan */}
      <div className="mt-6">
        <div className="skeleton h-5 w-32" />
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-sand bg-white p-4">
              <div className="flex items-center gap-2.5">
                <div className="skeleton-on-card h-8 w-8 rounded-full" />
                <div className="skeleton-on-card h-3 w-28" />
              </div>
              <div className="skeleton-on-card mt-3 h-3 w-full" />
              <div className="skeleton-on-card mt-1.5 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

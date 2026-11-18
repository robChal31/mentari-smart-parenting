import { getDictionary } from "@/lib/i18n/get-dictionary";

/**
 * Loading state /community.
 *
 * Meniru CommunityPage: `max-w-5xl`, header dengan judul + tombol "thread baru",
 * lalu daftar kartu thread. Tiap kartu punya avatar persegi (rounded-2xl,
 * bg-secondary-soft), judul, dan baris meta penulis.
 */
export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label={dict.errors.loadingAria}
    >
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="skeleton h-3 w-24" />
          <div className="skeleton mt-2 h-9 w-64" />
          <div className="skeleton mt-2 h-4 w-72 max-w-md" />
        </div>
        <div className="skeleton h-11 w-40 rounded-2xl" />
      </div>

      {/* daftar thread */}
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-sand bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="skeleton-on-card h-11 w-11 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-on-card h-5 w-3/4" />
                <div className="skeleton-on-card h-3 w-1/2" />
              </div>
              <div className="skeleton-on-card hidden h-6 w-20 rounded-full sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton bersama untuk halaman-halaman sederhana (statis & auth).
 *
 * Sebelumnya semua route tanpa `loading.tsx` sendiri mewarisi `app/loading.tsx`
 * milik beranda — jadi membuka /privacy sempat menampilkan hero + grid kartu
 * konten, padahal halaman itu cuma teks. Komponen di sini menyamakan bentuk
 * skeleton dengan bentuk halaman aslinya.
 */

/** Halaman teks: about, help, privacy, terms. */
export function ProsePageSkeleton({ maxWidth = "max-w-3xl" }: { maxWidth?: string }) {
  return (
    <div className={`mx-auto ${maxWidth} px-4 py-12 sm:px-6`}>
      <div className="skeleton h-3 w-28" />
      <div className="skeleton mt-2 h-9 w-full" />
      <div className="skeleton mt-2 h-9 w-3/5" />
      <div className="skeleton mt-4 h-4 w-full max-w-2xl" />

      <div className="mt-8 space-y-3">
        {[100, 97, 92, 100, 88, 95, 70].map((w, i) => (
          <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
        ))}
      </div>

      <div className="skeleton mt-8 h-6 w-48" />
      <div className="mt-3 space-y-3">
        {[98, 100, 90, 84].map((w, i) => (
          <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Halaman auth: login, register (panel kiri gelap + form kanan). */
export function AuthPageSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
      {/* panel kiri (navy) */}
      <div className="hidden rounded-[2rem] bg-secondary p-8 lg:block">
        <div className="h-10 w-10 rounded-xl bg-white/20" />
        <div className="mt-6 space-y-2">
          <div className="h-8 w-full rounded bg-white/20" />
          <div className="h-8 w-2/3 rounded bg-white/20" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-3.5 w-full rounded bg-white/10" />
          <div className="h-3.5 w-3/4 rounded bg-white/10" />
        </div>
      </div>

      {/* form kanan */}
      <div className="mx-auto w-full max-w-md self-center">
        <div className="skeleton h-6 w-32" />
        <div className="mt-4 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-2.5 w-24" />
              <div className="skeleton h-12 w-full rounded-2xl" />
            </div>
          ))}
          <div className="skeleton h-12 w-full rounded-2xl" />
        </div>
        <div className="skeleton mx-auto mt-4 h-3 w-40" />
      </div>
    </div>
  );
}

/** Halaman /forgot-password — satu kartu sempit. */
export function NarrowCardSkeleton() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-sand bg-white p-7">
        <div className="skeleton-on-card h-5 w-40" />
        <div className="skeleton-on-card mt-2 h-3 w-full" />
        <div className="skeleton-on-card mt-1.5 h-3 w-3/4" />
        <div className="skeleton-on-card mt-5 h-2.5 w-24" />
        <div className="skeleton-on-card mt-1.5 h-12 w-full rounded-2xl" />
        <div className="skeleton-on-card mt-4 h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton dashboard admin — dipakai halaman admin (saat auth belum siap) dan
 * `app/admin/loading.tsx` (saat navigasi). Strukturnya mengikuti
 * AdminPage: kicker + judul + badge peran, tab bar, lalu grid kartu statistik.
 */
export function AdminDashboardSkeleton() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="skeleton h-3 w-40" />
          <div className="skeleton mt-2 h-9 w-72" />
        </div>
        <div className="skeleton h-8 w-40 rounded-full" />
      </header>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-sand pb-4">
        {[92, 104, 96, 128, 88, 110].map((w, i) => (
          <div key={i} className="skeleton h-10 rounded-2xl" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-sand bg-white p-4">
            <div className="skeleton-on-card h-9 w-9 rounded-2xl" />
            <div className="skeleton-on-card mt-2 h-6 w-12" />
            <div className="skeleton-on-card mt-1.5 h-2.5 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Skeleton halaman profil — mengikuti ProfilePage: header avatar + identitas,
 * dua kartu (gamifikasi & anak), lalu kartu bookmark.
 */
export function ProfileSkeleton() {
  return (
    <>
      <header className="flex flex-wrap items-center gap-4">
        <div className="skeleton-on-card h-16 w-16 shrink-0 rounded-3xl" />
        <div className="space-y-2">
          <div className="skeleton-on-card h-6 w-48" />
          <div className="skeleton-on-card h-3.5 w-56" />
          <div className="skeleton-on-card h-4 w-20 rounded-full" />
        </div>
      </header>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-3xl border border-sand bg-white p-6">
            <div className="skeleton-on-card h-5 w-40" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="skeleton-on-card h-20 rounded-2xl" />
              ))}
            </div>
            <div className="skeleton-on-card mt-4 h-2.5 w-28" />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((j) => (
                <div key={j} className="skeleton-on-card h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-3xl border border-sand bg-white p-6">
        <div className="skeleton-on-card h-5 w-44" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-on-card h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Skeleton halaman perkembangan anak — mengikuti DevelopmentPage: kicker +
 * judul + subjudul anak, kartu progres navy, lalu kartu kategori milestone.
 */
export function DevelopmentPageSkeleton() {
  return (
    <>
      <header>
        <div className="skeleton h-3 w-28" />
        <div className="skeleton mt-2 h-9 w-72" />
        <div className="skeleton mt-2 h-3.5 w-40" />
      </header>
      <div className="mt-6 rounded-3xl bg-secondary p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-white/20" />
            <div className="h-7 w-48 rounded bg-white/25" />
          </div>
          <div className="h-16 w-16 rounded-2xl bg-white/15" />
        </div>
        <div className="mt-4 h-2.5 w-full rounded-full bg-white/15" />
      </div>
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-sand bg-white p-5">
            <div className="flex items-center gap-2">
              <div className="skeleton-on-card h-7 w-7 rounded-xl" />
              <div className="skeleton-on-card h-4 w-40" />
            </div>
            <div className="skeleton-on-card mt-3 h-3 w-full" />
            <div className="skeleton-on-card mt-1.5 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </>
  );
}

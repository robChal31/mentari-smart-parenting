import { DevelopmentPageSkeleton } from "@/components/page-skeleton";

/**
 * Loading state /development saat navigasi.
 *
 * Route ini sebelumnya tidak punya loading.tsx sendiri, sehingga mewarisi
 * app/loading.tsx milik beranda (hero + grid kartu konten) — jelas tidak cocok
 * untuk halaman berbasis dashboard. Bentuk skeleton ini mengikuti layout asli.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6" aria-busy="true">
      <DevelopmentPageSkeleton />
    </div>
  );
}

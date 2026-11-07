import { ContentCardSkeleton } from "@/components/content-card";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-busy="true" aria-label={dict.errors.loadingAria}>
      <div className="skeleton mb-6 h-8 w-64" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

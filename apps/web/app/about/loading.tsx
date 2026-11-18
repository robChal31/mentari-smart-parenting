import { ProsePageSkeleton } from "@/components/page-skeleton";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function Loading() {
  const { dict } = await getDictionary();

  return (
    <div aria-busy="true" aria-label={dict.errors.loadingAria}>
      <ProsePageSkeleton maxWidth="max-w-4xl" />
    </div>
  );
}

"use client";

import { TriangleAlert } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";

/** Inline red banner with retry — shown when an admin data load fails, so a failed request never looks like "no data". */
export function AdminErrorBanner({ onRetry }: { onRetry: () => void }) {
  const dict = useDictionary();
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
      <span className="inline-flex items-center gap-2 font-semibold">
        <TriangleAlert size={15} aria-hidden />
        {dict.common.loadError}
      </span>
      <button onClick={onRetry} className="rounded-xl bg-red-600 px-4 py-2 text-[11px] font-bold text-white transition hover:bg-red-700">
        {dict.common.retry}
      </button>
    </div>
  );
}

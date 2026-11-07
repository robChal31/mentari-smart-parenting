"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/components/i18n-provider";
import { format } from "@/lib/i18n/format";

/** Local progress indicator for a learning path (percent of modules opened). */
export function PathProgress({ slug, total }: { slug: string; total: number }) {
  const dict = useDictionary();
  const [done, setDone] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`mentari.path.${slug}`);
      const visited = raw ? (JSON.parse(raw) as string[]).length : 0;
      setDone(Math.min(visited, total));
    } catch {
      setDone(0);
    }
  }, [slug, total]);

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
        <span>{dict.paths.progressLabel}</span>
        <span>{format(dict.paths.progressDetail, { done, total, pct })}</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-[#7EF0E2] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

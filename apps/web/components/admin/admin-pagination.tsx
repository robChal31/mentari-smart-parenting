"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";
import { format } from "@/lib/i18n/format";

/**
 * Shared paginator for every admin list (contents, products, authors,
 * learning paths, community, users). The API already returns
 * `meta.total`/`totalPages`; tabs previously requested limit=50 and threw
 * the meta away, so anything past the first page was unreachable.
 */
export function AdminPagination({
  page,
  limit,
  total,
  onPageChange,
  disabled = false,
}: {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const dict = useDictionary();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total <= limit) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label={dict.admin.paginationAria}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-sand px-5 py-3"
    >
      <p className="text-[11px] sm:text-[10px] font-semibold text-muted">
        {format(dict.admin.paginationRange, { first, last, total })}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
          aria-label={dict.admin.prevPage}
          className="inline-flex items-center gap-1 rounded-xl border border-sand bg-white px-3 py-1.5 text-[11px] font-bold text-secondary transition hover:border-secondary/40 disabled:opacity-40"
        >
          <ChevronLeft size={13} /> {dict.admin.prevPage}
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
          .map((n, index, list) => (
            <span key={n} className="flex items-center gap-1.5">
              {index > 0 && list[index - 1] !== n - 1 && <span className="text-[11px] text-muted">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(n)}
                aria-current={n === page ? "page" : undefined}
                disabled={disabled}
                className={`min-w-8 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                  n === page
                    ? "bg-secondary text-white"
                    : "border border-sand bg-white text-secondary hover:border-secondary/40"
                }`}
              >
                {n}
              </button>
            </span>
          ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || disabled}
          aria-label={dict.admin.nextPage}
          className="inline-flex items-center gap-1 rounded-xl border border-sand bg-white px-3 py-1.5 text-[11px] font-bold text-secondary transition hover:border-secondary/40 disabled:opacity-40"
        >
          {dict.admin.nextPage} <ChevronRight size={13} />
        </button>
      </div>
    </nav>
  );
}

import { intlTag, type Locale } from "./i18n/config";
import { format } from "./i18n/format";
import type { Dictionary } from "./i18n/get-dictionary";

export type TimeDict = Dictionary["time"];
export type PriceFallbacks = Pick<Dictionary["products"], "free" | "contactUs">;

/** Compact view counts using the locale's unit suffixes (rb/jt vs k/m). */
export function formatViews(views: number, t: TimeDict): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} ${t.millionShort}`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(/\.0$/, "")} ${t.thousandShort}`;
  return String(views);
}

/**
 * Format a product price. Kept only for the product detail page —
 * catalogue cards deliberately never surface prices (see item 4/5).
 */
export function formatPrice(price: number | null | undefined, locale: Locale, fb: PriceFallbacks, currency = "IDR"): string {
  if (price === null || price === undefined) return fb.contactUs;
  if (price === 0) return fb.free;
  return new Intl.NumberFormat(intlTag(locale), { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(intlTag(locale), { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function formatDuration(seconds: number | null | undefined, t: TimeDict): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return format(t.minutesReadShort, { minutes });
}

export function formatRelativeTime(iso: string, locale: Locale, t: TimeDict): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return format(t.minutesAgo, { minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return format(t.hoursAgo, { hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return format(t.daysAgo, { days });
  return formatDate(iso, locale);
}

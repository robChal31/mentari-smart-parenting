// i18n configuration — cookie-based locale (no URL prefix).
// The locale lives in a plain cookie (`mentari.locale`) so it is readable
// from both server components (next/headers) and the browser (switcher).
export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "mentari.locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "en" ? "en" : "id";
}

/** Intl locale tag for date/number formatting. */
export function intlTag(locale: Locale): string {
  return locale === "en" ? "en-GB" : "id-ID";
}

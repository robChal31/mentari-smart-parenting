import { getLocale } from "./get-locale";
import { DEFAULT_LOCALE, type Locale } from "./config";
import id from "./dictionaries/id";
import en from "./dictionaries/en";

export type Dictionary = typeof id;
export type { Locale };

const dictionaries: Record<Locale, Dictionary> = { id, en: en as Dictionary };

/** Load the dictionary for the request locale (server-only). */
export async function getDictionary(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale().catch(() => DEFAULT_LOCALE);
  return { locale, dict: dictionaries[locale] };
}

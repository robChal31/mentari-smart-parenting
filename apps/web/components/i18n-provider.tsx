"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { type Locale } from "@/lib/i18n/config";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Makes the server-loaded dictionary available to client components.
 * Mounted once in the root layout with the serialized dictionary.
 */
export function I18nProvider({ locale, dict, children }: I18nContextValue & { children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useDictionary(): Dictionary {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useDictionary must be used within <I18nProvider>");
  return ctx.dict;
}

export function useLocale(): Locale {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used within <I18nProvider>");
  return ctx.locale;
}

"use client";

import Link from "next/link";
import { Sun } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";

export function Logo({ compact = false }: { compact?: boolean }) {
  const dict = useDictionary();
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={dict.logo.homeAria}>
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-linear-to-br from-primary-bright to-primary-deep text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-transform group-hover:scale-105">
        <Sun size={20} strokeWidth={2.4} fill="currentColor" className="text-cream" />
      </span>
      {!compact && (
        <span className="leading-tight">
          {/* Navbar sekarang hijau tua: "Mentari" terracotta dan "Smart Parent"
              krem. Kombinasi lama (terracotta + hijau tua) hanya 1.4 kontras —
              praktis tak terbaca. */}
          <span className="block font-heading text-[1.15rem] font-extrabold tracking-tight text-primary-on-dark">
            Mentari <span className="text-cream">Smart Parent</span>
          </span>
          <span className="hidden text-[0.62rem] font-medium uppercase tracking-[0.14em] text-cream/60 sm:block">
            {dict.logo.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}

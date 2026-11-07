"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Mail } from "lucide-react";
import { useDictionary } from "@/components/i18n-provider";

export default function HelpPage() {
  const dict = useDictionary();
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary-soft text-secondary"><HelpCircle size={26} aria-hidden /></span>
      <h1 className="mt-5 font-heading text-3xl font-extrabold text-secondary">{dict.help.title}</h1>
      <p className="mt-2 text-sm leading-6 text-muted">{dict.help.sub}</p>

      <div className="mt-8 divide-y divide-sand overflow-hidden rounded-3xl border border-sand bg-white">
        {dict.help.items.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={index}>
              <button
                onClick={() => setOpen(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-cream/50"
              >
                <span className="text-sm font-bold text-ink">{item.q}</span>
                <ChevronDown size={18} className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {isOpen && <div className="px-6 pb-5"><p className="max-w-2xl text-sm leading-7 text-muted">{item.a}</p></div>}
            </div>
          );
        })}
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-cream px-5 py-4 text-xs text-muted">
        <Mail size={14} aria-hidden /> {dict.help.contactNote} <a href="mailto:halo@mentari.id" className="font-bold text-secondary hover:underline">halo@mentari.id</a> · {dict.help.contactOr} <Link href="/community" className="font-bold text-primary hover:underline">{dict.help.communityLink}</Link>
      </p>
    </div>
  );
}

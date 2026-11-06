"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

/** Link that records the module visit in localStorage for PathProgress. */
export function PathModuleLink({
  slug, moduleId, href, children,
}: {
  slug: string; moduleId: string; href: string; children: ReactNode;
}) {
  function markVisited() {
    try {
      const key = `mentari.path.${slug}`;
      const raw = window.localStorage.getItem(key);
      const visited = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      visited.add(moduleId);
      window.localStorage.setItem(key, JSON.stringify([...visited]));
    } catch {
      // storage unavailable — progress just won't persist
    }
  }

  return (
    <Link
      href={href}
      onClick={markVisited}
      className="group flex items-start gap-4 rounded-3xl border border-sand bg-white p-5 transition hover:border-primary/30 hover:shadow-md"
    >
      {children}
    </Link>
  );
}

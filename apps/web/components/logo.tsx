import Link from "next/link";
import { Sun } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="MentariSmartParent — Beranda">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#FF8E53] text-white shadow-[0_4px_14px_rgba(255,107,53,0.4)] transition-transform group-hover:scale-105">
        <Sun size={20} strokeWidth={2.4} fill="currentColor" className="text-[#FFE27A]" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-heading text-[1.15rem] font-extrabold tracking-tight text-secondary">
            Mentari<span className="text-primary">SmartParent</span>
          </span>
          <span className="hidden text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted sm:block">
            Tumbuh cerdas, bahagia & penuh kasih
          </span>
        </span>
      )}
    </Link>
  );
}

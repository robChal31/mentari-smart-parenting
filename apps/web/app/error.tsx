"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[mentari] route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary-soft text-primary">
        <TriangleAlert size={30} aria-hidden />
      </span>
      <h1 className="mt-6 font-heading text-2xl font-extrabold text-secondary">Ups, ada yang tidak beres</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Kami gagal memuat halaman ini. Coba muat ulang — kalau masih gagal, tim Mentari sedang kami minta cek.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-deep"
      >
        Muat Ulang Halaman
      </button>
    </div>
  );
}

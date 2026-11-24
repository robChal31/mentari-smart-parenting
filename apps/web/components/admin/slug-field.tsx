"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Lock, Unlock } from "lucide-react";

/**
 * Slugify yang identik dengan `slugify()` di packages/shared dan
 * admin.service.ts. Dipertahankan sama persis supaya slug yang ditampilkan di
 * form sama dengan yang disimpan API — kalau beda, pengguna melihat satu hal
 * dan mendapat hal lain setelah simpan.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
}

/**
 * Kolom slug yang mengikuti judul secara otomatis.
 *
 * Perilaku yang diinginkan pengguna:
 *  - Form baru: slug terisi sendiri sambil judul diketik. Tidak ada input manual
 *    yang membuat orang berpikir slug itu wajib.
 *  - Form edit: slug TIDAK berubah saat judul diubah, karena URL yang sudah
 *    dibagikan atau diindeks mesin pencari akan mati. Ini alasan slug dibekukan
 *    saat mengedit, bukan karena teknis.
 *  - Kalau perlu slug khusus, ada tombol "ubah manual". Setelah dibuka, isi
 *    manual tidak akan ditimpa judul lagi.
 */
export function SlugField({
  title,
  slug,
  onChange,
  locked,
  label = "Slug",
}: {
  /** Sumber slug otomatis — judul konten/produk. */
  title: string;
  slug: string;
  onChange: (next: string) => void;
  /** True saat mengedit data yang sudah punya slug: jangan ubah otomatis. */
  locked?: boolean;
  label?: string;
}) {
  // form baru   → ikut judul
  // form edit   → dikunci (URL lama tetap hidup)
  const [manual, setManual] = useState(Boolean(locked));
  const lastAuto = useRef(locked ? slug : "");

  useEffect(() => {
    if (manual) return;
    const next = slugify(title);
    if (next === lastAuto.current) return;
    lastAuto.current = next;
    onChange(next);
    // onChange sengaja tidak masuk dependensi: identitas fungsi dari parent
    // berubah tiap render dan akan memicu loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, manual]);

  const isAuto = !manual;

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{label}</span>
        <button
          type="button"
          onClick={() => {
            setManual((prev) => !prev);
            if (manual) {
              // Kembali ke otomatis: sinkronkan lagi dengan judul.
              lastAuto.current = "";
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] sm:text-[10px] font-bold text-secondary/70 transition hover:text-secondary"
        >
          {isAuto ? <Lock size={10} /> : <Unlock size={10} />}
          {isAuto ? "Ubah manual" : "Ikuti judul lagi"}
        </button>
      </div>

      <div className="relative mt-1.5">
        <Link2
          size={13}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted/60"
          aria-hidden
        />
        <input
          value={slug}
          readOnly={isAuto}
          onChange={(e) => onChange(slugify(e.target.value))}
          placeholder="otomatis-dari-judul"
          pattern="[a-z0-9-]*"
          className={`w-full rounded-2xl border border-sand py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-primary ${
            isAuto ? "cursor-default bg-cream/40 text-muted" : "bg-white text-ink"
          }`}
        />
      </div>

      <p className="mt-1 text-[11px] sm:text-[10px] leading-relaxed text-muted">
        {isAuto
          ? "Dibuat otomatis dari judul. Kamu tidak perlu mengisinya."
          : locked
            ? "Slug dibekukan agar tautan lama tidak rusak. Buka “Ikuti judul lagi” untuk menyinkronkan ulang."
            : "Diisi manual. Buka “Ikuti judul lagi” untuk kembali otomatis."}
      </p>
    </div>
  );
}

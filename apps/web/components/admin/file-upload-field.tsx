"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { getToken } from "@/lib/client-api";

/**
 * Batas yang sama dengan API (apps/api/src/uploads/upload.rules.ts).
 *
 * Sengaja diduplikasi, bukan diimpor: klien tidak boleh bergantung pada kode
 * server. Kalau salah satu berubah, `GET /uploads/rules` adalah sumber
 * kebenaran — komponen ini hanya mencegah unggahan yang pasti ditolak, supaya
 * pengguna tidak menunggu transfer 20 MB untuk ditolak di akhir.
 */
const IMAGE_MAX = 5 * 1024 * 1024;
const GIF_MAX = 8 * 1024 * 1024;

// Video TIDAK diunggah — kolom video diisi URL (YouTube/embed atau berkas yang
// di-host sendiri). Komponen ini hanya untuk gambar.

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Kompres foto di browser sebelum diunggah.
 *
 * Foto kamera HP 4–8 MB adalah penyebab tersering "upload gagal". Daripada
 * menolaknya dan menyuruh pengguna membuka Photoshop, kita perkecil ke sisi
 * terpanjang 1600px dengan kualitas 0.82 — cukup tajam untuk kartu 400px dan
 * hero, dan biasanya turun ke 150–400 KB. GIF tidak disentuh (animasi akan
 * hilang) dan video juga tidak.
 */
async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    // Sudah kecil — jangan disentuh, kompresi hanya menurunkan kualitas.
    if (scale === 1 && file.size < 600 * 1024) {
      bitmap.close();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Browser lama tanpa createImageBitmap — kirim apa adanya, server tetap
    // memvalidasi ukuran dan isi.
    return file;
  }
}

function limitFor(file: File): number {
  return file.type === "image/gif" ? GIF_MAX : IMAGE_MAX;
}

/**
 * Kolom unggah berkas untuk form admin.
 *
 * Nilai yang dikirim ke API adalah URL relatif (`/uploads/...`), persis seperti
 * thumbnail bawaan (`/content-thumbs/...`). Jadi DB tetap menyimpan path, dan
 * domain VPS tidak tertanam di data.
 */
export function FileUploadField({
  label,
  value,
  onChange,
  subdir = "content",
  hint,
  previewClassName = "h-24 w-40",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  subdir?: string;
  hint?: string;
  previewClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const accept = "image/jpeg,image/png,image/webp,image/gif";

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    // Reset value agar memilih berkas yang sama dua kali tetap memicu onChange.
    event.target.value = "";
    if (!picked) return;

    setError(null);
    setNotice(null);

    const limit = limitFor(picked);
    if (picked.size > limit) {
      setError(
        `Berkas ${formatBytes(picked.size)}, melebihi batas ${formatBytes(limit)}. ` +
          `Perkecil dulu — untuk foto, simpan ulang di bawah 1600px.`,
      );
      return;
    }

    setBusy(true);
    try {
      const file = await compressImage(picked);

      if (file.size > limit) {
        setError(`Setelah dikecilkan masih ${formatBytes(file.size)}, batasnya ${formatBytes(limit)}.`);
        setBusy(false);
        return;
      }

      const form = new FormData();
      form.append("file", file);

      const token = getToken();
      const res = await fetch(
        `/api/v1/uploads?subdir=${encodeURIComponent(subdir)}`,
        {
          method: "POST",
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
          body: form,
        },
      );

      const body = (await res.json().catch(() => null)) as
        | { success?: boolean; data?: { url: string; size: number }; error?: { message?: string } }
        | null;

      if (!res.ok || !body?.success || !body.data?.url) {
        setError(body?.error?.message ?? `Unggahan gagal (HTTP ${res.status}).`);
        setBusy(false);
        return;
      }

      // Ganti berkas lama: hapus supaya disk VPS tidak menumpuk gambar yatim.
      if (value && value.startsWith("/uploads/")) {
        void fetch(`/api/v1/uploads?url=${encodeURIComponent(value)}`, {
          method: "DELETE",
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
        }).catch(() => undefined);
      }

      onChange(body.data.url);
      if (file.size < picked.size) {
        setNotice(`Dikecilkan otomatis: ${formatBytes(picked.size)} → ${formatBytes(file.size)}.`);
      }
    } catch {
      setError("Tidak dapat mengunggah berkas. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{label}</span>

      <div className="mt-1.5 flex items-start gap-3">
        {value ? (
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className={`${previewClassName} rounded-2xl border border-sand object-cover`}
              onError={(e) => {
                e.currentTarget.style.opacity = "0.25";
              }}
            />
          </div>
        ) : (
          <div
            className={`${previewClassName} flex shrink-0 items-center justify-center rounded-2xl border border-dashed border-sand bg-cream/40 text-muted`}
          >
            <ImagePlus size={20} aria-hidden />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-sand bg-white px-3 py-2 text-xs font-bold text-secondary transition hover:border-secondary/40 disabled:opacity-60"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
              {busy ? "Mengunggah…" : value ? "Ganti berkas" : "Pilih berkas"}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  if (value.startsWith("/uploads/")) {
                    const token = getToken();
                    void fetch(`/api/v1/uploads?url=${encodeURIComponent(value)}`, {
                      method: "DELETE",
                      headers: token ? { authorization: `Bearer ${token}` } : undefined,
                    }).catch(() => undefined);
                  }
                  onChange("");
                  setNotice(null);
                }}
                className="inline-flex items-center gap-1 rounded-2xl border border-sand px-2.5 py-2 text-[11px] font-bold text-muted transition hover:text-danger"
              >
                <Trash2 size={12} /> Hapus
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handlePick}
            className="hidden"
            aria-label={label}
          />

          {/* URL tetap bisa dilihat/ditempel manual — berguna untuk aset lama
              yang sudah ada di /public atau CDN. */}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/content/….jpg"
            aria-label={`${label} (URL)`}
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-3 py-2 text-[11px] text-muted outline-none transition focus:border-primary"
          />

          <p className="mt-1 text-[10px] leading-relaxed text-muted">
            {hint ?? "JPG, PNG, WebP (maks 5 MB) atau GIF (maks 8 MB). Foto besar dikecilkan otomatis ke 1600px."}
          </p>
          {notice && <p className="mt-1 text-[10px] font-semibold text-accent-deep">{notice}</p>}
          {error && (
            <p role="alert" className="mt-1 rounded-xl status-danger border px-2.5 py-1.5 text-[10px] text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

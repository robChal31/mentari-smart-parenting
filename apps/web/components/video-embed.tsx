"use client";

import { useState } from "react";
import { Play, ExternalLink, MonitorPlay, Music2, Camera } from "lucide-react";
import type { VideoSource } from "@/lib/video";

/**
 * Pemutar video untuk konten: YouTube, TikTok, Instagram, atau berkas langsung.
 *
 * Kenapa pakai "klik dulu baru load" (facade), bukan iframe langsung:
 *  - TikTok memuat sekitar 4,5 MB dalam 12 detik pertama, Instagram juga berat.
 *    Kalau iframe dipasang langsung, setiap pengunjung halaman artikel ikut
 *    menanggung beban itu walau tidak menonton.
 *  - Embed ketiga platform menaruh cookie pihak ketiga. Dengan facade, cookie
 *    baru muncul setelah pengunjung menyatakan mau menonton.
 *  - Tidak perlu `<script>` platform sama sekali; ketiganya punya bentuk iframe
 *    langsung, jadi tidak ada embed.js yang harus disuntik dan di-sync.
 *
 * Yang dirender setelah klik SELALU `embedUrl` hasil susunan `lib/video.ts`,
 * bukan string mentah dari admin.
 */

const ASPECT_CLASS: Record<VideoSource["aspect"], string> = {
  "16/9": "aspect-video",
  "9/16": "aspect-[9/16]",
  "4/5": "aspect-[4/5]",
};

const PROVIDER_STYLE: Record<
  VideoSource["provider"],
  { icon: React.ReactNode; tint: string; ring: string }
> = {
  youtube: {
    // lucide v1.70 menghapus ikon brand, jadi dipakai ikon generik + warna platform.
    icon: <MonitorPlay size={26} strokeWidth={1.8} aria-hidden />,
    tint: "bg-[#FF0000]",
    ring: "ring-[#FF0000]/25",
  },
  tiktok: {
    icon: <Music2 size={26} strokeWidth={1.8} aria-hidden />,
    tint: "bg-[#010101]",
    ring: "ring-black/25",
  },
  instagram: {
    icon: <Camera size={26} strokeWidth={1.8} aria-hidden />,
    tint: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    ring: "ring-[#DD2A7B]/25",
  },
  file: {
    icon: <Play size={26} strokeWidth={1.8} aria-hidden />,
    tint: "bg-primary",
    ring: "ring-primary/25",
  },
};

export function VideoEmbed({
  source,
  title,
  playLabel,
  externalLabel,
}: {
  source: VideoSource;
  title: string;
  playLabel: string;
  externalLabel: string;
}) {
  const [active, setActive] = useState(false);

  // Berkas video langsung: pakai <video> native, tanpa facade (ringan).
  if (source.provider === "file") {
    return (
      <figure className="mt-6 overflow-hidden rounded-3xl border border-sand bg-black shadow-sm">
        <video
          controls
          preload="metadata"
          playsInline
          className={`${ASPECT_CLASS[source.aspect]} w-full`}
          aria-label={title}
        >
          <source src={source.embedUrl} />
        </video>
      </figure>
    );
  }

  const style = PROVIDER_STYLE[source.provider];
  // TikTok dan Instagram butuh lebar terbatas; kalau dipaksa selebar kolom
  // artikel, player vertikalnya jadi terlalu besar dan terpotong.
  const vertical = source.aspect !== "16/9";

  if (active) {
    return (
      <figure className="mt-6">
        <div
          className={
            vertical
              ? "mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-sand bg-black shadow-sm"
              : "overflow-hidden rounded-3xl border border-sand bg-black shadow-sm"
          }
        >
          <iframe
            src={source.embedUrl}
            title={`${source.label}: ${title}`}
            className={`${ASPECT_CLASS[source.aspect]} w-full`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        </div>
        <figcaption className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted">
          <ExternalLink size={11} aria-hidden />
          <a
            href={source.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition hover:text-primary hover:underline"
          >
            {externalLabel}
          </a>
        </figcaption>
      </figure>
    );
  }

  // ===== Facade: menampilkan platform + tombol putar, belum memuat apa pun =====
  return (
    <figure className="mt-6">
      <button
        type="button"
        onClick={() => setActive(true)}
        className={
          vertical
            ? "group mx-auto flex w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-sand bg-secondary text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            : "group flex w-full flex-col overflow-hidden rounded-3xl border border-sand bg-secondary text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        }
        aria-label={`${playLabel} — ${source.label}: ${title}`}
      >
        <div
          className={`${ASPECT_CLASS[source.aspect]} relative grid w-full place-items-center bg-gradient-to-br from-secondary-deep via-secondary to-[#0B3E68]`}
        >
          {/* pola titik halus, senada dengan hero */}
          <span aria-hidden className="dot-grid absolute inset-0 opacity-40" />
          <span
            className={`relative grid h-16 w-16 place-items-center rounded-full ${style.tint} text-white shadow-lg ring-4 ${style.ring} transition-transform group-hover:scale-105`}
          >
            {style.icon}
          </span>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
            {source.label}
          </span>
        </div>
        <span className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-white">
            <Play size={13} aria-hidden className="fill-current" />
            {playLabel}
          </span>
          <span className="text-[10px] font-semibold text-white/55">{externalLabel}</span>
        </span>
      </button>
    </figure>
  );
}

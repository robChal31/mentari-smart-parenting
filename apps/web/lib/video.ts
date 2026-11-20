/**
 * Pengenalan tautan video: YouTube, TikTok, Instagram, dan berkas video langsung.
 *
 * Kenapa modul terpisah dari `format.ts`: ini bukan sekadar memformat teks, tapi
 * mem-parsing URL dari empat platform yang bentuk tautannya berbeda-beda, lalu
 * memutuskan bagaimana video dirender. Semua logika itu perlu bisa diuji
 * terpisah dan dipakai baik oleh halaman konten maupun form admin.
 *
 * Prinsip keamanan: admin hanya menempel tautan, dan kita TIDAK pernah
 * menaruh string mentah dari admin ke dalam `src` iframe. Yang kita ekstrak
 * hanya ID/shortcode, lalu kita susun ulang URL dari template yang kita
 * kontrol sendiri. Kalau tautan tidak dikenali, kita tidak menebak — kita
 * tampilkan tautannya sebagai kartu keluar, bukan iframe.
 */

export type VideoProvider = "youtube" | "tiktok" | "instagram" | "file";

export interface VideoSource {
  provider: VideoProvider;
  /** ID video (YouTube/TikTok/file) atau shortcode (Instagram). */
  id: string;
  /** URL iframe yang aman, sudah disusun dari template internal. */
  embedUrl: string;
  /** URL asli untuk tombol "buka di platform". */
  originalUrl: string;
  /** Rasio aspek. 9/16 vertikal (Reels/Shorts), 4/5 postingan IG, 16/9 horizontal. */
  aspect: "16/9" | "9/16" | "4/5";
  /** Label platform untuk UI, mis. "YouTube". */
  label: string;
}

const YT_ID = /^[A-Za-z0-9_-]{6,}$/;
const TT_ID = /^\d{6,}$/;
const IG_SHORTCODE = /^[A-Za-z0-9_-]{5,}$/;

/** Ambil hostname dengan aman; `null` kalau bukan URL valid. */
function hostOf(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
  } catch {
    return null;
  }
}

/**
 * Kalau input belum berupa URL (mis. admin menempel ID saja), coba tempel
 * prefiks supaya `new URL()` bisa membacanya. Hanya dipakai untuk mendeteksi
 * bentuk "ID mentah", bukan untuk menebak platform.
 */
function asUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** YouTube: youtu.be, watch?v=, /shorts/, /live/, /embed/. */
function parseYouTube(input: string): VideoSource | null {
  const value = asUrl(input.trim());
  const host = hostOf(value);
  if (!host) return null;

  let id: string | undefined;
  let vertical = false;

  if (host === "youtu.be") {
    id = new URL(value).pathname.split("/").filter(Boolean)[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "watch") {
      id = url.searchParams.get("v") ?? undefined;
    } else if (parts[0] === "shorts") {
      id = parts[1];
      vertical = true;
    } else if (parts[0] === "live" || parts[0] === "embed" || parts[0] === "v") {
      id = parts[1];
    }
  }

  if (!id || !YT_ID.test(id)) return null;

  return {
    provider: "youtube",
    id,
    embedUrl: `https://www.youtube.com/embed/${id}`,
    originalUrl: `https://www.youtube.com/watch?v=${id}`,
    aspect: vertical ? "9/16" : "16/9",
    label: "YouTube",
  };
}

/** TikTok: /@user/video/ID, /t/ID, /embed/v2/ID, /player/v1/ID, atau ID mentah. */
function parseTikTok(input: string): VideoSource | null {
  const trimmed = input.trim();
  // ID mentah (semua digit) — orang kadang menempel ini saja.
  if (TT_ID.test(trimmed)) {
    return {
      provider: "tiktok",
      id: trimmed,
      embedUrl: `https://www.tiktok.com/player/v1/${trimmed}`,
      originalUrl: `https://www.tiktok.com/@i/video/${trimmed}`,
      aspect: "9/16",
      label: "TikTok",
    };
  }

  const value = asUrl(trimmed);
  const host = hostOf(value);
  if (!host || !/(^|\.)tiktok\.com$/.test(host)) return null;

  const parts = new URL(value).pathname.split("/").filter(Boolean);
  let id: string | undefined;

  // /@user/video/123456  ·  /t/123456  ·  /embed/v2/123456  ·  /player/v1/123456
  const videoIdx = parts.indexOf("video");
  if (videoIdx !== -1) {
    id = parts[videoIdx + 1];
  } else if (parts[0] === "t") {
    id = parts[1];
  } else if (parts[0] === "embed" || parts[0] === "player") {
    // ambil segmen numerik terakhir
    id = [...parts].reverse().find((p) => TT_ID.test(p));
  }

  if (!id || !TT_ID.test(id)) return null;

  return {
    provider: "tiktok",
    id,
    embedUrl: `https://www.tiktok.com/player/v1/${id}`,
    originalUrl: `https://www.tiktok.com/@i/video/${id}`,
    aspect: "9/16",
    label: "TikTok",
  };
}

/**
 * Instagram: /p/, /reel/, /reels/, /tv/ — dengan atau tanpa /embed.
 * Instagram menyajikan iframe tanpa script di `/{tipe}/{shortcode}/embed`.
 */
function parseInstagram(input: string): VideoSource | null {
  const value = asUrl(input.trim());
  const host = hostOf(value);
  if (!host || !/(^|\.)instagram\.com$/.test(host)) return null;

  const parts = new URL(value).pathname.split("/").filter(Boolean);
  const kind = parts[0];
  if (!kind || !["p", "reel", "reels", "tv"].includes(kind)) return null;

  const shortcode = parts[1];
  if (!shortcode || !IG_SHORTCODE.test(shortcode)) return null;

  // Instagram memakai /reel/ untuk Reels; /p/ tetap diterima keduanya.
  const pathKind = kind === "reels" ? "reel" : kind;

  return {
    provider: "instagram",
    id: shortcode,
    embedUrl: `https://www.instagram.com/${pathKind}/${shortcode}/embed`,
    originalUrl: `https://www.instagram.com/${pathKind}/${shortcode}/`,
    // Reels vertikal penuh; postingan biasa di IG lebih kotak (4:5).
    aspect: pathKind === "reel" ? "9/16" : "4/5",
    label: "Instagram",
  };
}

/** Berkas video langsung (.mp4/.webm/.ogg) — dirender dengan <video>, bukan iframe. */
function parseFile(input: string): VideoSource | null {
  const value = input.trim();
  if (!/^https?:\/\//i.test(value)) return null;
  if (!/\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(value)) return null;
  if (!hostOf(value)) return null;

  const path = new URL(value).pathname;
  return {
    provider: "file",
    id: path,
    embedUrl: value,
    originalUrl: value,
    aspect: "16/9",
    label: "Video",
  };
}

/**
 * Ubah apa pun yang ditempel admin menjadi `VideoSource` yang bisa dirender.
 * Mengembalikan `null` kalau tidak dikenali — pemanggil yang memutuskan
 * fallback-nya (kartu tautan), bukan fungsi ini.
 */
export function parseVideoUrl(raw: string | null | undefined): VideoSource | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  return parseYouTube(value) ?? parseTikTok(value) ?? parseInstagram(value) ?? parseFile(value);
}

/**
 * Normalisasi tautan video ke bentuk kanonik untuk DISIMPAN di database.
 *
 * Dulu fungsi ini hanya mengenal YouTube, sehingga tautan TikTok/Instagram
 * disimpan apa adanya dan iframe-nya kosong. Sekarang semua platform
 * dinormalisasi ke `embedUrl` yang sudah tervalidasi. Tautan yang tidak
 * dikenali dibiarkan apa adanya supaya tidak ada data yang hilang.
 */
export function normaliseVideoUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return parseVideoUrl(value)?.embedUrl ?? value;
}

/** Nama platform untuk pesan validasi di form admin. */
export function videoProviderLabel(raw: string): string | null {
  return parseVideoUrl(raw)?.label ?? null;
}

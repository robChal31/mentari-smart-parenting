/**
 * Aturan upload berkas — satu sumber kebenaran untuk API dan pesan error.
 *
 * Kenapa tidak percaya `mimetype` dari browser?
 * ---------------------------------------------
 * Server mengirim Content-Type yang bisa dipalsukan: berkas `.jpg` berisi HTML
 * bisa lolos dan disajikan kembali sebagai halaman. Jadi setiap berkas diperiksa
 * lewat *magic bytes* (byte pertama berkas), bukan dari nama atau header.
 * Ekstensi hasil simpan juga ditentukan dari hasil deteksi itu.
 *
 * Video TIDAK diunggah
 * --------------------
 * Kolom video memakai URL (YouTube/embed atau berkas yang kamu host sendiri),
 * bukan berkas kiriman. Alasannya: video berukuran puluhan MB membebani disk VPS
 * dan memblokir request lain saat diunggah. Karena itu hanya gambar yang
 * diterima di sini — memperkecil permukaan serangan sekaligus kuota disk.
 *
 * Batas ukuran
 * ------------
 * 5 MB cukup untuk foto ~1600px hasil kamera HP. GIF dipisah karena animasi
 * cepat membesar. Semua angka bisa ditimpa lewat env supaya kuota VPS bisa
 * disesuaikan tanpa mengubah kode.
 */


export interface FormatSpec {
  /** Nama format untuk pesan error. */
  label: string;
  /** Ekstensi yang dipakai saat menyimpan (ditentukan dari magic bytes). */
  ext: string;
  /** Ukuran maksimum dalam byte, dibaca saat dipanggil agar env sempat termuat. */
  maxBytes: () => number;
}

const mb = (n: number) => n * 1024 * 1024;

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Format gambar yang diterima. SVG sengaja TIDAK ada di daftar: SVG adalah
 * dokumen yang bisa memuat skrip, dan kita menyajikan berkas dari domain yang
 * sama — cukup untuk mencuri sesi admin.
 */
const imageFormats: Record<string, FormatSpec> = {
  jpg: { label: 'JPG', ext: 'jpg', maxBytes: () => envInt('UPLOAD_IMAGE_MAX_BYTES', mb(5)) },
  png: { label: 'PNG', ext: 'png', maxBytes: () => envInt('UPLOAD_IMAGE_MAX_BYTES', mb(5)) },
  webp: { label: 'WebP', ext: 'webp', maxBytes: () => envInt('UPLOAD_IMAGE_MAX_BYTES', mb(5)) },
  gif: { label: 'GIF', ext: 'gif', maxBytes: () => envInt('UPLOAD_GIF_MAX_BYTES', mb(8)) },
};

/** Format yang boleh masuk, dipakai juga untuk menyusun pesan error. */
export function allowedFormats(): Record<string, FormatSpec> {
  return imageFormats;
}

/** Batas terbesar yang mungkin lolos (dipakai sebagai plafon multipart). */
export function hardLimitBytes(): number {
  const configured = envInt('UPLOAD_HARD_LIMIT_BYTES', 0);
  if (configured > 0) return configured;
  return Math.max(...Object.values(imageFormats).map((f) => f.maxBytes()));
}

/**
 * Deteksi format dari magic bytes.
 *
 * Dibuat sempit dengan sengaja: hanya signature yang kita dukung. `null`
 * berarti berkas ditolak, apa pun namanya. MP4/WebM sengaja tidak dideteksi
 * supaya video yang disamarkan tetap ditolak di sini, bukan lolos lalu
 * menumpuk di disk.
 */
export function detectFormat(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // GIF: "GIF87a" / "GIF89a"
  const gifHead = buffer.subarray(0, 6).toString('ascii');
  if (gifHead === 'GIF87a' || gifHead === 'GIF89a') return 'gif';

  // WebP: "RIFF" ....  "WEBP"
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }

  return null;
}

export interface ValidatedUpload {
  format: string;
  ext: string;
  size: number;
}

/**
 * Validasi lengkap: format dari isi berkas, lalu ukuran terhadap batas format
 * itu. Melempar Error dengan pesan yang menyebut angka aslinya, bukan "file
 * terlalu besar" tanpa konteks.
 */
export function validateUpload(file: { buffer: Buffer; size: number }): ValidatedUpload {
  const names = Object.values(imageFormats)
    .map((f) => f.label)
    .join(', ');

  const detected = detectFormat(file.buffer);
  if (!detected || !imageFormats[detected]) {
    throw new Error(
      `Gambar harus berupa berkas ${names} yang asli — isi berkas tidak dikenali. ` +
        'Video tidak diunggah; isi kolom video dengan URL.',
    );
  }

  const spec = imageFormats[detected];
  const maxBytes = spec.maxBytes();
  if (file.size > maxBytes) {
    throw new Error(
      `${spec.label} terlalu besar: ${formatBytes(file.size)}. Maksimum ${formatBytes(maxBytes)} — perkecil dulu sebelum diunggah.`,
    );
  }

  return { format: detected, ext: spec.ext, size: file.size };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validateUpload, allowedFormats, formatBytes } from './upload.rules';

/**
 * Penyimpanan berkas di disk VPS.
 *
 * Kenapa disk, bukan S3?
 * ----------------------
 * Seluruh stack berjalan di satu VPS. Objek storage eksternal menambah
 * ketergantungan jaringan yang justru bisa membuat halaman gagal saat layanan
 * itu lambat. Untuk satu VPS, disk lokal adalah pilihan paling sederhana.
 *
 * PENTING — lokasi folder
 * -----------------------
 * `UPLOAD_DIR` WAJIB diisi ke path absolut di LUAR folder deploy
 * (mis. `/var/lib/mentari/uploads`). Default-nya `process.cwd()/uploads`,
 * yang di PM2 berarti `/home/ubuntu/apps/uploads` — bercampur dengan kode hasil
 * deploy. Selama folder itu tidak pernah dihapus, berkas aman; tapi satu
 * `rsync --delete` atau deploy bersih akan melenyapkan semua gambar. Karena itu
 * env-nya wajib diset di produksi, dan peringatan dicatat saat boot bila tidak.
 *
 * Nama berkas
 * -----------
 * UUID, bukan nama asli kiriman: nama asli bisa berisi `../../`, karakter aneh,
 * atau menabrak berkas lain. UUID juga membuat URL tidak bisa ditebak.
 */
export const UPLOAD_SUBDIRS = ['content', 'product', 'learning-path', 'author', 'child'] as const;
export type UploadSubdir = (typeof UPLOAD_SUBDIRS)[number];

/** Folder akar. Di Docker/produksi arahkan ke volume agar tidak hilang saat rebuild. */
export function uploadRoot(): string {
  return path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads'));
}

/** URL publik yang dipakai web. Relatif supaya domain tidak tertanam di DB. */
export function publicPathFor(subdir: string, filename: string): string {
  const base = (process.env.UPLOAD_PUBLIC_PATH ?? '/uploads').replace(/\/+$/, '');
  return `${base}/${subdir}/${filename}`;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  /**
   * Dicatat sekali saat service pertama dipakai. Tanpa `UPLOAD_DIR`, berkas
   * mendarat relatif terhadap cwd proses — berbahaya di produksi karena mudah
   * terhapus saat deploy. Lebih baik ribut sekali daripada kehilangan data diam-diam.
   */
  private warnedAboutRoot = false;

  private warnIfDefaultRoot() {
    if (this.warnedAboutRoot) return;
    this.warnedAboutRoot = true;
    if (!process.env.UPLOAD_DIR) {
      this.logger.warn(
        `UPLOAD_DIR tidak diset — berkas disimpan di ${uploadRoot()} (relatif terhadap cwd proses). ` +
          'Di produksi set ke path absolut di luar folder deploy, mis. /var/lib/mentari/uploads.',
      );
    }
  }

  async save(
    file: { buffer: Buffer; size: number; originalname?: string },
    subdir: UploadSubdir,
  ): Promise<{ url: string; filename: string; format: string; size: number }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException({ code: 'NO_FILE', message: 'Tidak ada berkas yang dikirim.' });
    }

    this.warnIfDefaultRoot();

    let validated;
    try {
      validated = validateUpload(file);
    } catch (error) {
      // Aturan kita sendiri yang menolak — 400, bukan 500.
      throw new BadRequestException({
        code: 'INVALID_FILE',
        message: error instanceof Error ? error.message : 'Berkas tidak valid.',
      });
    }

    const dir = path.join(uploadRoot(), subdir);
    await mkdir(dir, { recursive: true });

    // Nama dari UUID + ekstensi hasil deteksi isi berkas (bukan nama kiriman).
    const filename = `${randomUUID()}.${validated.ext}`;
    const target = path.join(dir, filename);

    // Pertahanan terakhir: pastikan path hasil gabungan tetap di dalam folder
    // yang dituju. Tidak bisa terjadi dengan UUID, tapi murah untuk dipastikan.
    if (!target.startsWith(dir + path.sep)) {
      throw new BadRequestException({ code: 'INVALID_PATH', message: 'Nama berkas tidak valid.' });
    }

    // flag 'wx' = gagal kalau berkas sudah ada, bukan menimpa diam-diam.
    await writeFile(target, file.buffer, { flag: 'wx' });

    this.logger.log(
      `simpan ${subdir}/${filename} (${validated.format}, ${formatBytes(validated.size)}) dari ${file.originalname ?? 'tanpa-nama'}`,
    );

    return {
      url: publicPathFor(subdir, filename),
      filename,
      format: validated.format,
      size: validated.size,
    };
  }

  /** Batas yang berlaku sekarang — dipakai UI untuk menampilkan aturan. */
  rules() {
    return {
      image: Object.entries(allowedFormats()).map(([key, spec]) => ({
        format: key,
        label: spec.label,
        maxBytes: spec.maxBytes(),
        maxLabel: formatBytes(spec.maxBytes()),
      })),
      subdirs: [...UPLOAD_SUBDIRS],
      // Video tidak diunggah: kolomnya diisi URL, bukan berkas.
      video: 'url-only',
      uploadDir: uploadRoot(),
      usingDefaultDir: !process.env.UPLOAD_DIR,
    };
  }

  /**
   * Hapus berkas yang kita kelola. Hanya menerima URL di dalam folder upload
   * sendiri, sehingga endpoint tidak bisa dipakai menghapus berkas sistem.
   */
  async removeByUrl(url: string): Promise<boolean> {
    const base = (process.env.UPLOAD_PUBLIC_PATH ?? '/uploads').replace(/\/+$/, '');
    if (!url.startsWith(`${base}/`)) return false;

    const relative = url.slice(base.length + 1);
    const root = uploadRoot();
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep)) return false;

    try {
      await unlink(target);
      return true;
    } catch {
      return false;
    }
  }

  /** Ringkasan pemakaian disk, untuk halaman admin/ops. */
  async usage(): Promise<{ totalBytes: number; files: number; perSubdir: Record<string, number>; uploadDir: string }> {
    const root = uploadRoot();
    const perSubdir: Record<string, number> = {};
    let totalBytes = 0;
    let files = 0;

    for (const subdir of UPLOAD_SUBDIRS) {
      const dir = path.join(root, subdir);
      let bytes = 0;
      try {
        for (const name of await readdir(dir)) {
          try {
            const info = await stat(path.join(dir, name));
            if (info.isFile()) {
              bytes += info.size;
              files += 1;
            }
          } catch {
            // berkas hilang di tengah pembacaan — abaikan
          }
        }
      } catch {
        // folder belum ada
      }
      perSubdir[subdir] = bytes;
      totalBytes += bytes;
    }

    return { totalBytes, files, perSubdir, uploadDir: root };
  }
}

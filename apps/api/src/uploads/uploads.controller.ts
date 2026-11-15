import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { hardLimitBytes } from './upload.rules';
import { UploadsService, UPLOAD_SUBDIRS, type UploadSubdir } from './uploads.service';

/**
 * Unggah gambar (thumbnail, cover produk, avatar, thumbnail learning path).
 *
 * Batas multipart dipasang di plafon terbesar yang mungkin lolos (GIF 8 MB),
 * supaya berkas raksasa ditolak sebelum masuk memori. Batas per format yang
 * sebenarnya ditegakkan setelah isi berkas dikenali — karena hanya dari isi
 * kita tahu ini JPG (5 MB) atau GIF (8 MB).
 */
@Roles('ADMIN', 'EDITOR')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  /** Aturan yang sedang berlaku — dipakai form admin untuk menampilkan hint. */
  @Get('rules')
  rules() {
    return this.uploads.rules();
  }

  @Get('usage')
  usage() {
    return this.uploads.usage();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: hardLimitBytes(), files: 1 },
    }),
  )
  async upload(
    @UploadedFile() file: { buffer: Buffer; size: number; originalname?: string } | undefined,
    @Query('subdir') subdirRaw?: string,
  ) {
    const subdir = (UPLOAD_SUBDIRS as readonly string[]).includes(subdirRaw ?? '')
      ? (subdirRaw as UploadSubdir)
      : 'content';

    if (!file) {
      throw new BadRequestException({
        code: 'NO_FILE',
        message:
          'Tidak ada berkas yang diterima. Pastikan dikirim sebagai multipart/form-data dengan field bernama "file", ' +
          `dan ukurannya di bawah batas (maks ${(hardLimitBytes() / (1024 * 1024)).toFixed(0)} MB).`,
      });
    }

    return this.uploads.save(file, subdir);
  }

  /**
   * Hapus berkas yatim. Dipanggil form saat admin mengganti thumbnail, supaya
   * disk VPS tidak penuh oleh gambar yang sudah tidak dipakai.
   */
  @Delete()
  async remove(@Query('url') url?: string) {
    if (!url) {
      throw new BadRequestException({ code: 'NO_URL', message: 'Parameter url wajib diisi.' });
    }
    const removed = await this.uploads.removeByUrl(url);
    return { removed };
  }
}

import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const prefix = process.env.API_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(prefix);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3001'],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Berkas unggahan disajikan apa adanya, jadi header keamanan dipasang
  // eksplisit: jangan sampai browser menebak tipe berkas dan menjalankannya
  // sebagai halaman (XSS lewat berkas yang disamarkan).
  //
  // Folder dibuat saat boot supaya unggahan pertama tidak gagal hanya karena
  // foldernya belum ada.
  const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads'));
  const publicPath = (process.env.UPLOAD_PUBLIC_PATH ?? '/uploads').replace(/\/+$/, '');
  mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, {
    prefix: `${publicPath}/`,
    maxAge: '7d',
    index: false,
    dotfiles: 'deny',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'");
    },
  });

  const port = Number(process.env.API_PORT ?? 4000);
  const host = process.env.API_HOST ?? '::';
  await app.listen(port, host);
  // `::` is the IPv6 wildcard, which also accepts IPv4 on every supported
  // platform. That matters on Windows, where `localhost` resolves to ::1 first:
  // binding 0.0.0.0 alone leaves ::1 refused and the web app cannot connect even
  // though this log line says "ready".
  Logger.log(`🚀 Mentari Smart Parent API ready at http://localhost:${port}/${prefix}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API', err);
  process.exit(1);
});

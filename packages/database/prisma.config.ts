import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Auto-load the nearest .env walking upward (cwd → … → repo root). Node ≥ 20.12.
{
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}
// Default config: Supabase / PostgreSQL (schema.postgres.prisma).
// SQLite is no longer part of the supported setup — every database command
// targets the Postgres project in SUPABASE_DATABASE_URL (falling back to
// DATABASE_URL). For MySQL, use prisma.config.mysql.ts with the matching
// DATABASE_URL, e.g.:
//   PRISMA_SCHEMA=prisma/schema.prisma npx prisma db push --config prisma.config.mysql.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: process.env.PRISMA_SCHEMA ?? 'prisma/schema.postgres.prisma',
  datasource: {
    url:
      process.env.SUPABASE_DATABASE_URL ??
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});

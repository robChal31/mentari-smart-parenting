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
// Local-development config: SQLite file at packages/database/dev.db
// For MySQL (production), use prisma.config.mysql.ts with the matching
// DATABASE_URL, e.g.:
//   PRISMA_SCHEMA=prisma/schema.prisma npx prisma db push --config prisma.config.mysql.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: process.env.PRISMA_SCHEMA ?? 'prisma/schema.sqlite.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});

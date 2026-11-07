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
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'mysql://mentari:mentari_password@localhost:3306/mentari_smartparent',
  },
  migrations: {
    path: 'prisma/migrations-mysql',
    seed: 'tsx prisma/seed.ts',
  },
});

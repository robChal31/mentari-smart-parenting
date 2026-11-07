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
// Supabase (PostgreSQL) config. Uses the DIRECT connection (port 5432), not the
// pgBouncer pooler (6543) — schema push needs a session-mode connection.
//   SUPABASE_DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres" \
//     pnpm --filter=@mentari/database db:push:supabase
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.postgres.prisma',
  datasource: {
    url:
      process.env.SUPABASE_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  migrations: {
    path: 'prisma/migrations-supabase',
    seed: 'tsx prisma/seed.ts',
  },
});

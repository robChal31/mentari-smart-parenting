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

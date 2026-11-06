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

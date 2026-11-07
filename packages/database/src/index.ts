// ============================================================
// @mentari/database — Prisma client factory + shared instance
//
// Runtime selection is driven by DATABASE_URL:
//   file:... / libsql:...   → SQLite via @prisma/adapter-libsql (local dev default)
//   mysql://...             → MySQL via @prisma/adapter-mariadb (production)
//   postgres://...          → PostgreSQL / Supabase via @prisma/adapter-pg
//                             (use the direct 5432 connection or pgBouncer with
//                             pgbouncer=true; pooled 6543 works for queries)
// ============================================================
import './env';
import { loadEnvFiles } from './env';
loadEnvFiles(__dirname);
import path from 'node:path';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

// dist/index.js lives at packages/database/dist/index.js → pkgRoot is one level up.
const pkgRoot = path.resolve(__dirname, '..');

function resolveSqliteUrl(url: string): string {
  if (url.startsWith('libsql:')) return url;
  const p = url.slice('file:'.length);
  const absolute = path.isAbsolute(p) ? p : path.resolve(pkgRoot, p);
  return `file:${absolute}`;
}

export function createPrismaClient(
  databaseUrl: string = process.env.DATABASE_URL ?? 'file:./dev.db',
): PrismaClient {
  if (databaseUrl.startsWith('file:') || databaseUrl.startsWith('libsql:')) {
    const adapter = new PrismaLibSql({ url: resolveSqliteUrl(databaseUrl) });
    return new PrismaClient({ adapter });
  }
  if (databaseUrl.startsWith('mysql://')) {
    const adapter = new PrismaMariaDb(databaseUrl);
    return new PrismaClient({ adapter });
  }
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    return new PrismaClient({ adapter });
  }
  throw new Error(
    `Unsupported DATABASE_URL scheme. Use file:./dev.db (sqlite), mysql://user:pass@host:3306/db, or postgresql://… (Supabase). Got: ${databaseUrl}`,
  );
}

// Reuse a single client across hot reloads / module graphs in dev.
const globalForPrisma = globalThis as unknown as { __mentariPrisma?: PrismaClient };
export const prisma = globalForPrisma.__mentariPrisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.__mentariPrisma = prisma;

export { PrismaClient };
export * from './generated/prisma/client';
export default prisma;

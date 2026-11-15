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
import { readFileSync } from 'node:fs';
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

/**
 * Read the provider baked into the generated client (internal/class.ts embeds
 * the schema source). Used only to explain a provider mismatch — never to
 * decide which adapter to build.
 */
export function detectClientProvider(): 'sqlite' | 'postgresql' | 'mysql' | null {
  // The bundled dist/index.js embeds the same inlineSchema string; look there
  // first (that is what actually runs), then fall back to the generated source.
  const candidates: string[] = [];
  try { candidates.push(readFileSync(__filename, 'utf8')); } catch {}
  try {
    candidates.push(readFileSync(path.join(__dirname, 'generated/prisma/internal/class.ts'), 'utf8'));
  } catch {}
  for (const source of candidates) {
    const match = source.match(/provider = \W*?(postgresql|sqlite|mysql)/);
    if (match) return match[1] as 'sqlite' | 'postgresql' | 'mysql';
  }
  return null;
}

/** Wrap client construction to print an actionable message on provider mismatch. */
function withProviderHint(build: () => PrismaClient, target = '(unknown)'): PrismaClient {
  try {
    return build();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not compatible with the provider/i.test(message)) {
      throw new Error([
        message,
        '',
        'Hint: the committed Prisma client is generated for ONE provider (SQLite by default).',
        `The generated client currently targets: ${detectClientProvider() ?? 'unknown'}`,
        `Your DATABASE_URL targets: ${target}`,
        '',
        'Regenerate it for your target database, then rebuild & restart:',
        '  • local dev (SQLite):  pnpm --filter=@mentari/database db:generate',
        '  • Supabase (Postgres): pnpm --filter=@mentari/database db:generate:postgres',
        '  • MySQL:               pnpm --filter=@mentari/database db:generate:mysql',
        '  then:                  pnpm --filter=@mentari/database build',
        '',
        'Note: db:push:supabase / db:ddl:postgres / db:seed do NOT regenerate the client.',
        'Switching to Supabase needs db:generate:postgres, and switching back needs',
        'db:generate — otherwise the API keeps crashing with this error on every restart.',
      ].filter((line, i, all) => !(line === '' && i > 0 && all[i - 1] === '')).join('\n'));
    }
    throw error;
  }
}

export function createPrismaClient(
  databaseUrl: string = process.env.DATABASE_URL ?? 'file:./dev.db',
): PrismaClient {
  if (databaseUrl.startsWith('file:') || databaseUrl.startsWith('libsql:')) {
    const adapter = new PrismaLibSql({ url: resolveSqliteUrl(databaseUrl) });
    return withProviderHint(() => new PrismaClient({ adapter }), 'sqlite');
  }
  if (databaseUrl.startsWith('mysql://')) {
    const adapter = new PrismaMariaDb(databaseUrl);
    return withProviderHint(() => new PrismaClient({ adapter }), 'mysql');
  }
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    return withProviderHint(() => new PrismaClient({ adapter }), 'postgresql');
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

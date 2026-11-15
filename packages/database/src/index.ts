// ============================================================
// @mentari/database — Prisma client factory + shared instance
//
// PostgreSQL saja. Jalur MySQL/MariaDB dan SQLite sudah dihapus — menyisakan
// pilihan provider hanya membuat orang menunjuk schema yang salah.
// ============================================================
import './env';
import { loadEnvFiles } from './env';
loadEnvFiles(__dirname);
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

/**
 * Read the provider baked into the generated client (internal/class.ts embeds
 * the schema source). Used only to explain a provider mismatch — never to
 * decide which adapter to build.
 */
export function detectClientProvider(): 'postgresql' | null {
  // The bundled dist/index.js embeds the same inlineSchema string; look there
  // first (that is what actually runs), then fall back to the generated source.
  const candidates: string[] = [];
  try { candidates.push(readFileSync(__filename, 'utf8')); } catch {}
  try {
    candidates.push(readFileSync(path.join(__dirname, 'generated/prisma/internal/class.ts'), 'utf8'));
  } catch {}
  for (const source of candidates) {
    return /provider = \W*?postgresql/.test(source) ? 'postgresql' : null;
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
        'Hint: the committed Prisma client is generated for ONE provider at a time.',
        `The generated client currently targets: ${detectClientProvider() ?? 'unknown'}`,
        `Your DATABASE_URL targets: ${target}`,
        '',
        'Regenerate it for your target database, then rebuild & restart:',
        '  pnpm --filter=@mentari/database db:generate',
        '  pnpm build',
        '',
        'Note: db:push / db:ddl:postgres / db:seed do NOT regenerate the client.',
        'Regenerate klien setelah mengubah provider — kalau tidak, API',
        'keeps crashing with this error on every restart.',
      ].filter((line, i, all) => !(line === '' && i > 0 && all[i - 1] === '')).join('\n'));
    }
    throw error;
  }
}

export function createPrismaClient(
  databaseUrl: string =
    process.env.DATABASE_URL ?? '',
): PrismaClient {
  if (!databaseUrl) {
    throw new Error([
      'DATABASE_URL is not set.',
      '',
      'Add to the root .env:',
      '  DATABASE_URL="postgresql://mentari:<password>@127.0.0.1:5432/mentari_smart_parent"',
      '',
      'Hanya PostgreSQL yang didukung.',
    ].join('\n'));
  }
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    return withProviderHint(() => new PrismaClient({ adapter }), 'postgresql');
  }
  throw new Error(
    `Unsupported DATABASE_URL scheme. Use postgresql://… Got: ${databaseUrl.replace(/:[^:@/]+@/, ':***@')}`,
  );
}

// Reuse a single client across hot reloads / module graphs in dev.
const globalForPrisma = globalThis as unknown as { __mentariPrisma?: PrismaClient };
export const prisma = globalForPrisma.__mentariPrisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.__mentariPrisma = prisma;

export { PrismaClient };
export * from './generated/prisma/client';
export default prisma;

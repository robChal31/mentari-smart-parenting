/**
 * Offline `prisma db push` replacement.
 *
 * Prisma 7's CLI downloads the native schema-engine binary from
 * binaries.prisma.sh, which is unreachable on restricted/offline networks.
 * The same engine ships as WASM in @prisma/schema-engine-wasm, and Prisma's
 * driver adapters accept JS factories bound with bindMigrationAwareSqlAdapterFactory.
 * This script calls the WASM engine directly — no native binary, no network.
 *
 * Usage: node scripts/push-wasm.mjs [schema path] [database url] [--force]
 *   defaults: schema=prisma/schema.sqlite.prisma  url=$DATABASE_URL or file:./dev.db
 *   works for file:/libsql:/mysql:/postgres(ql): URLs — adapter is picked from the scheme.
 *   For Supabase: set SUPABASE_DATABASE_URL in your root .env, then
 *   pnpm db:push:supabase   (no shell-specific env syntax required)
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemaEngine } from '@prisma/schema-engine-wasm';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaPg } from '@prisma/adapter-pg';
import { bindMigrationAwareSqlAdapterFactory } from '@prisma/driver-adapter-utils';

// Auto-load the nearest .env walking upward (cwd → … → repo root).
// Existing environment variables win. Node ≥ 20.12.
for (let dir = process.cwd(); ; ) {
  try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const positional = args.filter((a) => !a.startsWith('--'));
const schemaPath = positional[0] ?? 'prisma/schema.sqlite.prisma';
const schemaAbs = path.resolve(root, schemaPath);
const url = positional[1] ?? process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL ?? 'file:./dev.db';
// Refuse the .env.example placeholder — otherwise the WASM engine dies with an
// opaque "External error id#0" and (worse) would print your real password into
// terminal logs if we logged the raw URL.
if (url.includes('<') || url.includes('>')) {
  console.error([
    'ERROR: the database URL still contains .env.example placeholders.',
    'Edit the ROOT .env and use a real connection string, e.g.',
    '  SUPABASE_DATABASE_URL="postgresql://postgres:<your-db-password>@db.<your-project-ref>.supabase.co:5432/postgres"',
    'Never run with the template copied as-is.',
  ].join('\n'));
  process.exit(1);
}
const maskedUrl = url.replace(/(:\/\/[^:/\s]+:)[^@/\s]*(@)/, '$1***$2');
const content = readFileSync(schemaAbs, 'utf8');

console.log(`Pushing ${schemaPath} -> ${maskedUrl}`);

function makeAdapter(rawUrl) {
  if (rawUrl.startsWith('mysql://')) return bindMigrationAwareSqlAdapterFactory(new PrismaMariaDb(rawUrl));
  if (rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://')) {
    return bindMigrationAwareSqlAdapterFactory(new PrismaPg({ connectionString: rawUrl }));
  }
  return bindMigrationAwareSqlAdapterFactory(new PrismaLibSql({ url: rawUrl }));
}
const adapter = makeAdapter(url);
const engine = await SchemaEngine.new(
  { datamodels: [[schemaAbs, content]] },
  (err) => console.error('[schema-engine error]', err),
  adapter,
);

const result = await engine.schemaPush({
  force,
  schema: { files: [{ path: schemaAbs, content }] },
  filters: { externalTables: [], externalEnums: [] },
});

console.log(`schemaPush OK — executed ${result.executedSteps} step(s).`);
if (result.unexecutable?.length) {
  console.error('Unexecutable steps:', result.unexecutable);
  process.exit(1);
}
if (result.warnings?.length) {
  console.warn('Warnings:', result.warnings);
}
await engine[Symbol.dispose]?.();
process.exit(0);

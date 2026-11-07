/**
 * Export a full DDL script for the Postgres schema (default: prisma/schema.postgres.prisma).
 *
 * Why this exists: @prisma/schema-engine-wasm (pinned for offline pushes) cannot
 * introspect hosted Postgres catalogs — even an empty database fails its
 * describe step with "Column type 'char' could not be deserialized" (reproduced
 * locally on stock PostgreSQL 16). The SQLite push path uses a different flavour
 * and is unaffected.
 *
 * This script only computes the DIFF from empty → datamodel **without applying
 * anything**; it does connect to the server (for version/feature detection) but
 * never writes to your database. Apply the resulting .sql yourself via the
 * Supabase SQL Editor (or `psql -v ON_ERROR_STOP=1 -f`).
 *
 * Usage:
 *   pnpm --filter=@mentari/database db:ddl:postgres
 *   node scripts/export-ddl.mjs [schema path] [output .sql] [database url]
 * Defaults: schema=prisma/schema.postgres.prisma  output=prisma/schema.postgres.sql
 *           url=$SUPABASE_DATABASE_URL or $DATABASE_URL (root .env is auto-loaded)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemaEngine } from '@prisma/schema-engine-wasm';
import { PrismaPg } from '@prisma/adapter-pg';
import { bindMigrationAwareSqlAdapterFactory } from '@prisma/driver-adapter-utils';

// Auto-load the nearest .env walking upward (cwd → … → repo root). Node ≥ 20.12.
for (let dir = process.cwd(); ; ) {
  try { process.loadEnvFile(path.join(dir, '.env')); break; } catch {}
  const parent = path.dirname(dir);
  if (parent === dir) break;
  dir = parent;
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const schemaPath = args[0] ?? 'prisma/schema.postgres.prisma';
const outPath = path.resolve(root, args[1] ?? 'prisma/schema.postgres.sql');
const schemaAbs = path.resolve(root, schemaPath);
const url = args[2] ?? process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!url) {
  console.error('No database URL. Set SUPABASE_DATABASE_URL (direct/session pooler 5432) in your root .env, or pass it as the third argument.');
  process.exit(1);
}
if (url.includes('<') || url.includes('>')) {
  console.error('ERROR: the database URL still contains .env.example placeholders. Use a real connection string.');
  process.exit(1);
}
const maskedUrl = url.replace(/(:\/\/[^:/\s]+:)[^@/\s]*(@)/, '$1***$2');
console.log(`Exporting DDL for ${schemaPath} (connects read-only to ${maskedUrl}) ...`);

const content = readFileSync(schemaAbs, 'utf8');
const adapter = bindMigrationAwareSqlAdapterFactory(new PrismaPg({ connectionString: url }));
const engine = await SchemaEngine.new(
  { datamodels: [[schemaAbs, content]] },
  (err) => console.error('[schema-engine error]', err),
  adapter,
);
const result = await engine.diff({
  from: { tag: 'empty' },
  to: { tag: 'schemaDatamodel', files: [{ path: schemaAbs, content }] },
  script: true,
  exitCode: null,
  filters: { externalTables: [], externalEnums: [] },
});
if (result.exitCode !== 0 || !result.stdout) {
  console.error('Diff failed:', result);
  await engine[Symbol.dispose]?.();
  process.exit(1);
}
writeFileSync(outPath, result.stdout);
console.log(`✅ Wrote ${result.stdout.length} bytes of DDL to ${path.relative(root, outPath)}`);
console.log('Apply it via the Supabase SQL Editor (paste & run) or:');
console.log(`  psql "${url.split('@')[0].split('://')[0]}://<user>@<host>/postgres" -v ON_ERROR_STOP=1 -f ${path.relative(root, outPath)}`);
await engine[Symbol.dispose]?.();
process.exit(0);

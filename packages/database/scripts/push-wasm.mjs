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
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchemaEngine } from '@prisma/schema-engine-wasm';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { bindMigrationAwareSqlAdapterFactory } from '@prisma/driver-adapter-utils';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const positional = args.filter((a) => !a.startsWith('--'));
const schemaPath = positional[0] ?? 'prisma/schema.sqlite.prisma';
const schemaAbs = path.resolve(root, schemaPath);
const url = positional[1] ?? process.env.DATABASE_URL ?? 'file:./dev.db';
const content = readFileSync(schemaAbs, 'utf8');

console.log(`Pushing ${schemaPath} -> ${url}`);

const adapter = bindMigrationAwareSqlAdapterFactory(new PrismaLibSql({ url }));
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

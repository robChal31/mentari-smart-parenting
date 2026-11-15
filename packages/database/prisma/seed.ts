/**
 * Seed data esensial Mentari Smart Parent.
 *
 * Bukan data demo. Yang dibuat hanya yang dibutuhkan aplikasi supaya bisa
 * dibuka tanpa error: age groups, kategori, satu author bawaan, dan dua akun
 * staf (admin + editor). Tidak ada konten/produk/thread/analitik palsu.
 *
 * Usage: pnpm db:seed   (butuh DATABASE_URL di .env root)
 *        SEED_ADMIN_PASSWORD=... SEED_EDITOR_PASSWORD=... pnpm db:seed
 */
import bcrypt from 'bcryptjs';
import { detectClientProvider, prisma } from '../src/index';
import { AGE_GROUPS, CATEGORIES, DEMO_AUTHOR, SEED_USERS } from './seed-data';

/**
 * Seeding dengan client yang di-generate untuk provider lain akan mati di tengah
 * wipe dengan "Driver Adapter ... not compatible with the provider ...".
 */
function warnOnProviderMismatch() {
  const url = process.env.DATABASE_URL ?? '';
  const wants = url.startsWith('postgres') ? 'postgresql' : null;
  const client = detectClientProvider();
  if (!wants || !client || client === wants) return;
  console.warn([
    '',
    `⚠️  Generated Prisma client targets "${client}" but the database URL targets "${wants}".`,
    '   Fix: pnpm db:generate',
    '',
  ].join('\n'));
}

/**
 * Wipe di bawah mengasumsikan schema sudah dibuat. Kalau belum, deleteMany
 * pertama mati dengan P2021 "table does not exist" yang terbaca seperti bug seed.
 */
async function assertSchemaPushed() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM "users" LIMIT 1`;
  } catch (error) {
    const { code, message } = error as { code?: string; message?: string };
    const missingTable =
      code === 'P2010' ||
      code === 'P2021' ||
      /relation ".+" does not exist|TableDoesNotExist/i.test(message ?? '');
    if (!missingTable) throw error;
    throw new Error([
      'The database schema has not been created yet (no "users" table).',
      '',
      'Create it first:',
      '',
      '  pnpm db:push             # creates any missing tables; safe to re-run',
      '  pnpm db:seed             # then retry the seed',
    ].join('\n'));
  }
}

async function main() {
  warnOnProviderMismatch();
  console.log('🌱 Seeding data esensial...');
  await assertSchemaPushed();

  // ---------- wipe (urutan aman terhadap foreign key) ----------
  // Seed ini idempoten: dijalankan ulang selalu menghasilkan state yang sama.
  await prisma.childMilestone.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.gamificationProfile.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.productClick.deleteMany();
  await prisma.contentView.deleteMany();
  await prisma.learningPathItem.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityThread.deleteMany();
  await prisma.contentProduct.deleteMany();
  await prisma.contentTag.deleteMany();
  await prisma.contentCategory.deleteMany();
  await prisma.contentAgeGroup.deleteMany();
  await prisma.content.deleteMany();
  await prisma.author.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.productAgeGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany();
  await prisma.ageGroup.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.child.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ data lama dibersihkan');

  // ---------- age groups ----------
  const ageGroupBySlug = new Map<string, { id: string }>();
  for (const ag of AGE_GROUPS) {
    const created = await prisma.ageGroup.create({ data: ag });
    ageGroupBySlug.set(ag.slug, created);
  }
  console.log(`✓ ${ageGroupBySlug.size} age groups`);

  // ---------- kategori (induk dulu, baru anak) ----------
  const categoryBySlug = new Map<string, { id: string }>();
  for (const cat of CATEGORIES.filter((c) => !c.parent)) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? null,
        icon: cat.icon ?? null,
        color: cat.color ?? null,
        sortOrder: cat.sortOrder ?? 0,
      },
    });
    categoryBySlug.set(cat.slug, created);
  }
  for (const cat of CATEGORIES.filter((c) => c.parent)) {
    const parent = categoryBySlug.get(cat.parent!);
    if (!parent) {
      console.warn(`! kategori "${cat.slug}" dilewati: induk "${cat.parent}" tidak ada`);
      continue;
    }
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? null,
        icon: cat.icon ?? null,
        color: cat.color ?? null,
        sortOrder: cat.sortOrder ?? 0,
        parentId: parent.id,
      },
    });
    categoryBySlug.set(cat.slug, created);
  }
  console.log(`✓ ${categoryBySlug.size} kategori`);

  // ---------- author bawaan ----------
  await prisma.author.create({
    data: {
      name: DEMO_AUTHOR.name,
      slug: DEMO_AUTHOR.slug,
      title: DEMO_AUTHOR.title,
      bio: DEMO_AUTHOR.bio,
      isActive: true,
      sortOrder: DEMO_AUTHOR.sortOrder,
    },
  });
  console.log('✓ 1 author bawaan');

  // ---------- akun staf: admin + editor ----------
  const created: Array<{ email: string; role: string; passwordFromEnv: boolean }> = [];
  for (const u of SEED_USERS) {
    const fromEnv = process.env[u.envVar];
    const plain = fromEnv || u.defaultPassword;
    if (plain.length < 8) {
      throw new Error(`${u.envVar} minimal 8 karakter (saat ini ${plain.length}).`);
    }
    const passwordHash = await bcrypt.hash(plain, 10);
    // Gamification profile opsional, tapi dibuat supaya /gamification/me tidak
    // mengembalikan 404 untuk akun staf yang login.
    await prisma.user.create({
      data: {
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        passwordHash,
        isActive: true,
        gamificationProfile: { create: { totalPoints: 0, currentStreak: 0, longestStreak: 0, level: 1 } },
      },
    });
    created.push({ email: u.email, role: u.role, passwordFromEnv: Boolean(fromEnv) });
  }
  console.log(`✓ ${created.length} akun staf`);

  console.log('\n✅ Seed selesai. Akun yang dibuat:');
  for (const u of created) {
    console.log(`   • ${u.role.padEnd(6)} ${u.email}  ${u.passwordFromEnv ? '(password dari env)' : '(password default)'}`);
  }
  const usingDefault = created.some((u) => !u.passwordFromEnv);
  if (usingDefault) {
    console.log([
      '',
      '⚠️  Masih ada akun dengan password default. Untuk server yang bisa diakses',
      '   publik, jalankan ulang dengan password sendiri:',
      '',
      '   SEED_ADMIN_PASSWORD=\'...\' SEED_EDITOR_PASSWORD=\'...\' pnpm db:seed',
      '   (di VPS tanpa repo: node /home/ubuntu/apps/scripts/seed.mjs)',
    ].join('\n'));
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * Seed MentariSmartParent with realistic Indonesian parenting content.
 * Wipes existing data and re-creates it — intended for dev/staging.
 *
 * Usage: pnpm db:seed   (requires the sqlite dev.db at packages/database/)
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/index';
import {
  AGE_GROUPS, CATEGORIES, CONTENTS, PRODUCTS, MILESTONES, BADGES,
  LEARNING_PATHS, THREADS, NOTIFICATIONS,
} from './seed-data';

// Deterministic PRNG for reproducible analytics seed data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 86_400_000;
const now = Date.now();

async function main() {
  console.log('🌱 Seeding MentariSmartParent...');

  // ---------- wipe (FK-safe order) ----------
  await prisma.childMilestone.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.notification.deleteMany();
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
  await prisma.tag.deleteMany();
  await prisma.productAgeGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany();
  await prisma.ageGroup.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.child.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ cleared existing data');

  // ---------- age groups ----------
  const ageGroupBySlug = new Map<string, { id: string }>();
  for (const ag of AGE_GROUPS) {
    const created = await prisma.ageGroup.create({ data: ag });
    ageGroupBySlug.set(ag.slug, created);
  }
  console.log(`✓ ${ageGroupBySlug.size} age groups`);

  // ---------- categories (parents, then children) ----------
  const categoryBySlug = new Map<string, { id: string }>();
  for (const cat of CATEGORIES.filter((c) => !c.parent)) {
    const created = await prisma.category.create({
      data: {
        name: cat.name, slug: cat.slug, description: cat.description,
        icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder ?? 0,
      },
    });
    categoryBySlug.set(cat.slug, created);
  }
  for (const cat of CATEGORIES.filter((c) => c.parent)) {
    const parent = categoryBySlug.get(cat.parent!);
    const created = await prisma.category.create({
      data: {
        name: cat.name, slug: cat.slug, description: cat.description,
        icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder ?? 0,
        parentId: parent?.id,
      },
    });
    categoryBySlug.set(cat.slug, created);
  }
  console.log(`✓ ${categoryBySlug.size} categories`);

  // ---------- users ----------
  const passwordHash = await bcrypt.hash('mentari123', 10);
  const hash = (email: string) => ({ email, passwordHash, isActive: true });
  const admin = await prisma.user.create({
    data: { ...hash('admin@mentari.id'), fullName: 'Mentari Admin', role: 'ADMIN' },
  });
  const mentari = await prisma.user.create({
    data: { ...hash('mentari@mentari.id'), fullName: 'Tim Mentari Smart Parent', role: 'EDITOR' },
  });
  const demo = await prisma.user.create({
    data: { ...hash('demo@mentari.id'), fullName: 'Ibu Ratna', role: 'USER' },
  });
  const communityEmails = [
    { email: 'ratna.dewi@example.com', fullName: 'Ratna Dewi' },
    { email: 'budi.s@example.com', fullName: 'Budi Santoso' },
    { email: 'sari.p@example.com', fullName: 'Sari Puspita' },
    { email: 'dimas.p@example.com', fullName: 'Dimas Prakoso' },
    { email: 'ratna.ningrum@example.com', fullName: 'Ratna Ningrum, S.Pd.' },
  ];
  const communityUsers = new Map<string, { id: string }>();
  for (const u of communityEmails) {
    const created = await prisma.user.create({
      data: { ...hash(u.email), fullName: u.fullName, role: 'USER' },
    });
    communityUsers.set(u.email, created);
  }
  const findUser = (email: string) =>
    email === 'mentari@mentari.id' ? mentari
    : email === 'admin@mentari.id' ? admin
    : email === 'demo@mentari.id' ? demo
    : communityUsers.get(email)!;
  console.log(`✓ ${3 + communityUsers.size} users`);

  // ---------- products ----------
  const productBySlug = new Map<string, { id: string }>();
  for (const p of PRODUCTS) {
    const created = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, description: p.description,
        shortDescription: p.shortDescription, type: p.type, price: p.price,
        currency: 'IDR', thumbnailUrl: p.thumbnailUrl, images: JSON.stringify([p.thumbnailUrl]),
        externalUrl: p.externalUrl, ctaText: p.ctaText,
        isFeatured: p.isFeatured, sortOrder: p.sortOrder, isActive: true,
        ageGroups: {
          create: p.ageGroupSlugs.map((slug) => ({ ageGroupId: ageGroupBySlug.get(slug)!.id })),
        },
      },
    });
    productBySlug.set(p.slug, created);
  }
  console.log(`✓ ${productBySlug.size} products`);

  // ---------- contents (+ tags) ----------
  const contentBySlug = new Map<string, { id: string }>();
  const tagBySlug = new Map<string, { id: string }>();
  const slugify = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  for (const c of CONTENTS) {
    const tagIds: string[] = [];
    for (const tagName of c.tags) {
      const slug = slugify(tagName);
      let tag = tagBySlug.get(slug);
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName, slug } });
        tagBySlug.set(slug, tag);
      }
      tagIds.push(tag.id);
    }
    const created = await prisma.content.create({
      data: {
        title: c.title, slug: c.slug, excerpt: c.excerpt, body: c.body,
        type: c.type, status: 'PUBLISHED',
        thumbnailUrl: null,
        videoUrl: c.videoUrl ?? null,
        videoDuration: c.videoDuration ?? null,
        readTime: c.readTime ?? null,
        isFeatured: c.isFeatured ?? false,
        isPremium: c.isPremium ?? false,
        viewCount: c.viewCount, likeCount: c.likeCount ?? Math.round(c.viewCount * 0.06),
        publishedAt: new Date(now - c.publishedDaysAgo * DAY),
        authorName: c.author.authorName, authorTitle: c.author.authorTitle,
        metaTitle: c.metaTitle ?? null, metaDescription: c.metaDescription ?? null,
        categories: {
          create: c.categorySlugs.map((slug) => ({ categoryId: categoryBySlug.get(slug)!.id })),
        },
        ageGroups: {
          create: c.ageGroupSlugs.map((slug) => ({ ageGroupId: ageGroupBySlug.get(slug)!.id })),
        },
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    contentBySlug.set(c.slug, created);
  }
  console.log(`✓ ${contentBySlug.size} contents, ${tagBySlug.size} tags`);

  // ---------- content ↔ product recommendations ----------
  const recommendations: Array<[string, string, number, string, number]> = [
    // [content slug, product slug, relevance, placement, order]
    ['panduan-mpasi-6-bulan', 'seri-dongeng-nusantara', 0.62, 'SIDEBAR', 1],
    ['panduan-mpasi-6-bulan', 'teacher-academy-ecd', 0.55, 'SIDEBAR', 2],
    ['takaran-mpasi-6-24-bulan', 'buku-aktivitas-anak-kreatif', 0.6, 'SIDEBAR', 1],
    ['persiapan-anak-masuk-sd' === 'x' ? '' : 'checklist-persiapan-anak-masuk-sd', 'buku-tematik-sd', 0.95, 'SIDEBAR', 1],
    ['checklist-persiapan-anak-masuk-sd', 'cambridge-primary-english', 0.9, 'SIDEBAR', 2],
    ['checklist-persiapan-anak-masuk-sd', 'mentari-digital-learning', 0.88, 'BOTTOM', 1],
    ['checklist-persiapan-anak-masuk-sd', 'english-assessment', 0.8, 'BOTTOM', 2],
    ['tanda-tanda-siap-sekolah', 'english-assessment', 0.85, 'SIDEBAR', 1],
    ['tanda-tanda-siap-sekolah', 'buku-tematik-sd', 0.78, 'SIDEBAR', 2],
    ['permainan-edukatif-tanpa-gadget', 'buku-aktivitas-anak-kreatif', 0.92, 'SIDEBAR', 1],
    ['permainan-edukatif-tanpa-gadget', 'seri-dongeng-nusantara', 0.75, 'BOTTOM', 1],
    ['stimulasi-bahasa-anak-1-3-tahun', 'seri-dongeng-nusantara', 0.9, 'SIDEBAR', 1],
    ['stimulasi-bahasa-anak-1-3-tahun', 'buku-aktivitas-anak-kreatif', 0.7, 'BOTTOM', 1],
    ['membentuk-self-esteem-anak-kalimat-ajaib', 'seri-dongeng-nusantara', 0.72, 'SIDEBAR', 1],
    ['pendekatan-montessori-anak-malas-belajar', 'mentari-digital-learning', 0.88, 'SIDEBAR', 1],
    ['pendekatan-montessori-anak-malas-belajar', 'buku-tematik-sd', 0.82, 'BOTTOM', 1],
    ['eksperimen-sains-sederhana-di-dapur', 'buku-aktivitas-anak-kreatif', 0.85, 'SIDEBAR', 1],
    ['keamanan-digital-anak-aturan-3c', 'mentari-digital-learning', 0.8, 'SIDEBAR', 1],
    ['screen-time-balita-batas-aman', 'mentari-digital-learning', 0.7, 'SIDEBAR', 1],
    ['checklist-bekal-sekolah-sehat', 'buku-tematik-sd', 0.6, 'SIDEBAR', 1],
    ['infografis-milestone-bicara-0-5-tahun', 'teacher-academy-ecd', 0.65, 'SIDEBAR', 1],
    ['kebutuhan-asi-bayi-sesuai-usia', 'teacher-academy-ecd', 0.6, 'SIDEBAR', 1],
    ['jadwal-imunisasi-dasar-lengkap', 'teacher-academy-ecd', 0.55, 'SIDEBAR', 1],
    ['co-parenting-setelah-bercerai', 'seri-dongeng-nusantara', 0.5, 'BOTTOM', 1],
  ];
  for (const [contentSlug, productSlug, relevanceScore, placement, sortOrder] of recommendations) {
    const content = contentBySlug.get(contentSlug);
    const product = productBySlug.get(productSlug);
    if (!content || !product) {
      console.warn(`! skipping recommendation ${contentSlug} → ${productSlug} (not found)`);
      continue;
    }
    await prisma.contentProduct.create({
      data: { contentId: content.id, productId: product.id, relevanceScore, placement, sortOrder },
    });
  }
  console.log('✓ content-product recommendations');

  // ---------- milestones ----------
  for (const m of MILESTONES) {
    await prisma.milestone.create({
      data: {
        title: m.title, description: m.description, category: m.category,
        sortOrder: m.sortOrder, ageGroupId: ageGroupBySlug.get(m.ageGroupSlug)!.id,
      },
    });
  }
  console.log(`✓ ${MILESTONES.length} milestones`);

  // ---------- badges ----------
  const badgeBySlug = new Map<string, { id: string }>();
  for (const b of BADGES) {
    const created = await prisma.badge.create({ data: b });
    badgeBySlug.set(b.slug, created);
  }
  console.log(`✓ ${badgeBySlug.size} badges`);

  // ---------- learning paths ----------
  for (const lp of LEARNING_PATHS) {
    const path = await prisma.learningPath.create({
      data: {
        title: lp.title, slug: lp.slug, description: lp.description,
        difficulty: lp.difficulty, estimatedTime: lp.estimatedTime,
        isPublished: true, sortOrder: lp.sortOrder,
      },
    });
    for (const [index, contentSlug] of lp.contentSlugs.entries()) {
      const content = contentBySlug.get(contentSlug);
      if (!content) continue;
      await prisma.learningPathItem.create({
        data: { learningPathId: path.id, contentId: content.id, sortOrder: index + 1 },
      });
    }
  }
  console.log(`✓ ${LEARNING_PATHS.length} learning paths`);

  // ---------- demo child + gamification + badges + bookmarks ----------
  const birthDate = new Date(now);
  birthDate.setFullYear(birthDate.getFullYear() - 5);
  birthDate.setMonth(birthDate.getMonth() - 2);
  const child = await prisma.child.create({
    data: { userId: demo.id, name: 'Aisha', birthDate, gender: 'FEMALE' },
  });
  const gamProfile = await prisma.gamificationProfile.create({
    data: {
      userId: demo.id, totalPoints: 130, currentStreak: 7, longestStreak: 14,
      lastActiveDate: new Date(now), level: 3,
    },
  });
  for (const slug of ['langkah-pertama', 'streak-7-hari', 'pembaca-setia']) {
    await prisma.userBadge.create({
      data: { gamificationProfileId: gamProfile.id, badgeId: badgeBySlug.get(slug)!.id },
    });
  }
  // Give Aisha a couple of completed milestones (bayi & batita stages)
  const batitaMilestones = await prisma.milestone.findMany({
    where: { ageGroup: { slug: { in: ['bayi', 'batita'] } } },
    orderBy: { sortOrder: 'asc' },
    take: 4,
  });
  for (const m of batitaMilestones) {
    await prisma.childMilestone.create({
      data: { childId: child.id, milestoneId: m.id, isCompleted: true, completedAt: new Date(now - 180 * DAY) },
    });
  }
  // Demo bookmarks
  for (const slug of ['panduan-mpasi-6-bulan', 'checklist-persiapan-anak-masuk-sd', 'permainan-edukatif-tanpa-gadget']) {
    const content = contentBySlug.get(slug);
    if (content) {
      await prisma.bookmark.create({ data: { userId: demo.id, contentId: content.id } });
    }
  }
  console.log('✓ demo account (demo@mentari.id / mentari123) with child Aisha, badges & bookmarks');

  // ---------- community ----------
  for (const t of THREADS) {
    const author = findUser(t.authorEmail);
    const thread = await prisma.communityThread.create({
      data: {
        title: t.title, body: t.body, categorySlug: t.categorySlug,
        isPinned: t.isPinned ?? false, userId: author.id,
        likeCount: t.likeCount, viewCount: t.viewCount, commentCount: t.comments.length,
        createdAt: new Date(now - Math.round((t.viewCount % 20) + 3) * DAY),
      },
    });
    for (const comment of t.comments) {
      const commenter = findUser(comment.authorEmail);
      await prisma.communityComment.create({
        data: { threadId: thread.id, userId: commenter.id, body: comment.body, likeCount: (comment.body.length % 9) + 1 },
      });
    }
  }
  console.log(`✓ ${THREADS.length} community threads`);

  // ---------- analytics: views & product clicks (last 30 days) ----------
  const rand = mulberry32(20250601);
  const contentList = [...contentBySlug.values()];
  const productList = [...productBySlug.values()];
  let viewRows = 0;
  for (let d = 0; d < 30; d += 1) {
    const perDay = Math.round(12 + rand() * 22);
    for (let i = 0; i < perDay; i += 1) {
      const content = contentList[Math.floor(rand() * contentList.length)];
      await prisma.contentView.create({
        data: {
          contentId: content.id,
          userId: rand() > 0.55 ? demo.id : null,
          sessionId: `sess_${d}_${i}`,
          duration: Math.round(30 + rand() * 420),
          createdAt: new Date(now - d * DAY - Math.round(rand() * DAY)),
        },
      });
      viewRows += 1;
    }
  }
  let clickRows = 0;
  const sources = ['SIDEBAR', 'SIDEBAR', 'SIDEBAR', 'INLINE', 'BOTTOM', 'BANNER'];
  for (let i = 0; i < 48; i += 1) {
    const product = productList[Math.floor(rand() * productList.length)];
    const content = contentList[Math.floor(rand() * contentList.length)];
    await prisma.productClick.create({
      data: {
        productId: product.id,
        contentId: content.id,
        userId: rand() > 0.6 ? demo.id : null,
        source: sources[Math.floor(rand() * sources.length)],
        createdAt: new Date(now - Math.floor(rand() * 29) * DAY),
      },
    });
    clickRows += 1;
  }
  console.log(`✓ ${viewRows} content views & ${clickRows} product clicks (30 days)`);

  // ---------- notifications for demo user ----------
  for (const n of NOTIFICATIONS) {
    await prisma.notification.create({ data: { ...n, userId: demo.id } });
  }
  console.log(`✓ ${NOTIFICATIONS.length} notifications`);

  console.log('\n✅ Seed complete. Login demo: demo@mentari.id / mentari123 · admin: admin@mentari.id / mentari123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

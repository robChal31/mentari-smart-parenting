import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@mentari/database';
import {
  slugify,
  type CreateCategoryInput,
  type CreateContentInput,
  type CreateProductInput,
  type ContentProductInput,
  type UpdateCategoryInput,
  type UpdateContentInput,
  type UpdateProductInput,
} from '@mentari/shared';
import {
  contentInclude,
  serializeCategory,
  serializeContentSummary,
  serializeProduct,
} from '../common/serializers/content.serializer';

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base) || 'item';
  let slug = root;
  let attempt = 0;
  while (await exists(slug)) {
    attempt += 1;
    slug = `${root}-${attempt + 1}`;
    if (attempt > 50) {
      slug = `${root}-${Math.random().toString(36).slice(2, 8)}`;
      break;
    }
  }
  return slug;
}

@Injectable()
export class AdminService {
  // ---------- Overview ----------
  async overview() {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const last14 = new Date(Date.now() - 14 * 86_400_000);

    const [
      totalUsers, totalContents, publishedContents, totalProducts, activeProducts,
      totalChildren, views30d, clicks30d, viewsRecent, topContents, topClickRows,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.content.count(),
      prisma.content.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      prisma.child.count(),
      prisma.contentView.count({ where: { createdAt: { gte: since } } }),
      prisma.productClick.count({ where: { createdAt: { gte: since } } }),
      prisma.contentView.findMany({ where: { createdAt: { gte: last14 } }, select: { createdAt: true } }),
      prisma.content.findMany({
        where: { status: 'PUBLISHED' },
        include: contentInclude,
        orderBy: { viewCount: 'desc' },
        take: 5,
      }),
      prisma.productClick.groupBy({ by: ['productId'], _count: { productId: true }, orderBy: { _count: { productId: 'desc' } }, take: 5 }),
    ]);

    const clickProducts = topClickRows.length
      ? await prisma.product.findMany({ where: { id: { in: topClickRows.map((r) => r.productId) } } })
      : [];
    const clickProductMap = new Map(clickProducts.map((p) => [p.id, p]));

    // Bucket views per day (last 14 days) for the sparkline chart
    const buckets = new Map<string, number>();
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 86_400_000);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const row of viewsRecent) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return {
      stats: {
        totalUsers, totalContents, publishedContents, totalProducts, activeProducts,
        totalChildren, views30d, clicks30d,
      },
      viewsByDay: [...buckets.entries()].map(([date, views]) => ({ date, views })),
      topContents: topContents.map(serializeContentSummary),
      topProducts: topClickRows.map((row) => ({
        productId: row.productId,
        name: clickProductMap.get(row.productId)?.name ?? 'Produk',
        slug: clickProductMap.get(row.productId)?.slug ?? '',
        clicks: row._count.productId,
      })),
    };
  }

  // ---------- Contents ----------
  async listContents(query: { page: number; limit: number; status?: string; q?: string }) {
    const where: Record<string, unknown> = {
      ...(query.status ? { status: query.status.toUpperCase() } : {}),
      ...(query.q ? { OR: [{ title: { contains: query.q } }, { slug: { contains: query.q } }] } : {}),
    };
    const [total, rows] = await prisma.$transaction([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return { items: rows.map(serializeContentSummary), total };
  }

  private contentWriteData(input: UpdateContentInput | CreateContentInput) {
    const data: Record<string, unknown> = {};
    const direct = [
      'excerpt', 'body', 'thumbnailUrl', 'videoUrl', 'videoDuration', 'readTime',
      'isPremium', 'authorName', 'authorTitle', 'authorAvatarUrl',
      'metaTitle', 'metaDescription', 'status',
    ] as const;
    for (const key of direct) {
      if (input[key] !== undefined) data[key] = input[key];
    }
    if ('title' in input && input.title !== undefined) data.title = input.title;
    if (input.type !== undefined) data.type = input.type;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
    if (input.publishedAt !== undefined) {
      data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
    }
    return data;
  }

  private async syncContentTaxonomy(contentId: string, input: UpdateContentInput | CreateContentInput) {
    // Categories
    if (input.categorySlugs !== undefined) {
      await prisma.contentCategory.deleteMany({ where: { contentId } });
      const categories = await prisma.category.findMany({ where: { slug: { in: input.categorySlugs } } });
      if (categories.length) {
        await prisma.contentCategory.createMany({ data: categories.map((c) => ({ contentId, categoryId: c.id })) });
      }
    }
    // Age groups
    if (input.ageGroupSlugs !== undefined) {
      await prisma.contentAgeGroup.deleteMany({ where: { contentId } });
      const ageGroups = await prisma.ageGroup.findMany({ where: { slug: { in: input.ageGroupSlugs } } });
      if (ageGroups.length) {
        await prisma.contentAgeGroup.createMany({ data: ageGroups.map((a) => ({ contentId, ageGroupId: a.id })) });
      }
    }
    // Tags
    if (input.tags !== undefined) {
      await prisma.contentTag.deleteMany({ where: { contentId } });
      for (const raw of input.tags) {
        const name = raw.trim();
        if (!name) continue;
        const slug = slugify(name);
        const tag = await prisma.tag.upsert({
          where: { slug },
          create: { name, slug },
          update: {},
        });
        await prisma.contentTag.upsert({
          where: { contentId_tagId: { contentId, tagId: tag.id } },
          create: { contentId, tagId: tag.id },
          update: {},
        });
      }
    }
  }

  async createContent(input: CreateContentInput) {
    const slug = input.slug ?? await uniqueSlug(input.title, async (s) => Boolean(await prisma.content.findUnique({ where: { slug: s } })));
    if (await prisma.content.findUnique({ where: { slug } })) {
      throw new BadRequestException({ code: 'DUPLICATE', message: 'Slug sudah digunakan.' });
    }
    const status = input.status ?? 'DRAFT';
    const content = await prisma.content.create({
      data: {
        title: input.title,
        slug,
        ...this.contentWriteData(input),
        type: input.type,
        status,
        publishedAt: status === 'PUBLISHED' ? (input.publishedAt ? new Date(input.publishedAt) : new Date()) : null,
      },
    });
    await this.syncContentTaxonomy(content.id, input);
    return this.findContent(content.id);
  }

  async findContent(id: string) {
    const content = await prisma.content.findUnique({ where: { id }, include: contentInclude });
    if (!content) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    return serializeContentSummary(content);
  }

  async updateContent(id: string, input: UpdateContentInput) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    const data: Record<string, unknown> = this.contentWriteData(input);
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.title !== undefined) data.title = input.title;
    if (input.status === 'PUBLISHED' && !existing.publishedAt && input.publishedAt === undefined) {
      data.publishedAt = new Date();
    }
    await prisma.content.update({ where: { id }, data });
    await this.syncContentTaxonomy(id, input);
    return this.findContent(id);
  }

  async deleteContent(id: string) {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    await prisma.content.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return { archived: true };
  }

  // ---------- Products ----------
  async listProducts(query: { page: number; limit: number; q?: string }) {
    const where: Record<string, unknown> = query.q
      ? { OR: [{ name: { contains: query.q } }, { slug: { contains: query.q } }] }
      : {};
    const [total, rows] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { ageGroups: { include: { ageGroup: true } } },
        orderBy: { sortOrder: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return { items: rows.map(serializeProduct), total };
  }

  async createProduct(input: CreateProductInput) {
    const slug = input.slug ?? await uniqueSlug(input.name, async (s) => Boolean(await prisma.product.findUnique({ where: { slug: s } })));
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        shortDescription: input.shortDescription ?? null,
        type: input.type,
        price: input.price ?? null,
        currency: input.currency ?? 'IDR',
        thumbnailUrl: input.thumbnailUrl ?? null,
        images: input.images ? JSON.stringify(input.images) : undefined,
        externalUrl: input.externalUrl ?? null,
        ctaText: input.ctaText ?? null,
        isFeatured: input.isFeatured ?? false,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
    await this.syncProductAgeGroups(product.id, input.ageGroupSlugs ?? []);
    return this.findProduct(product.id);
  }

  private async syncProductAgeGroups(productId: string, slugs: string[]) {
    await prisma.productAgeGroup.deleteMany({ where: { productId } });
    const groups = await prisma.ageGroup.findMany({ where: { slug: { in: slugs } } });
    if (groups.length) {
      await prisma.productAgeGroup.createMany({ data: groups.map((g) => ({ productId, ageGroupId: g.id })) });
    }
  }

  async findProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id }, include: { ageGroups: { include: { ageGroup: true } } } });
    if (!product) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan.' });
    return serializeProduct(product);
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan.' });
    const { ageGroupSlugs, images, price, ...rest } = input;
    const data: Record<string, unknown> = { ...rest };
    if (images !== undefined) data.images = images ? JSON.stringify(images) : '[]';
    if (price !== undefined) data.price = price ?? null;
    await prisma.product.update({ where: { id }, data });
    if (ageGroupSlugs !== undefined) await this.syncProductAgeGroups(id, ageGroupSlugs);
    return this.findProduct(id);
  }

  async deactivateProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan.' });
    // Soft delete — hidden from the public catalogue & recommendations, kept for analytics.
    await prisma.product.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
    return { deleted: true };
  }

  async restoreProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan.' });
    await prisma.product.update({ where: { id }, data: { isActive: true, deletedAt: null } });
    return { restored: true };
  }

  // ---------- Categories ----------
  async createCategory(input: CreateCategoryInput) {
    const slug = input.slug ?? await uniqueSlug(input.name, async (s) => Boolean(await prisma.category.findUnique({ where: { slug: s } })));
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        color: input.color ?? null,
        icon: input.icon ?? null,
        parentId: input.parentId ?? null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return serializeCategory(category);
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Kategori tidak ditemukan.' });
    const category = await prisma.category.update({ where: { id }, data: { ...input } });
    return serializeCategory(category);
  }

  // ---------- Users ----------
  async listUsers(query: { page: number; limit: number; q?: string }) {
    const where: Record<string, unknown> = query.q
      ? { OR: [{ email: { contains: query.q } }, { fullName: { contains: query.q } }] }
      : {};
    const [total, rows] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { _count: { select: { children: true, bookmarks: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return {
      items: rows.map((u) => ({
        id: u.id, email: u.email, fullName: u.fullName, role: u.role,
        isActive: u.isActive, lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        childrenCount: u._count.children, bookmarkCount: u._count.bookmarks,
      })),
      total,
    };
  }

  async setUserRole(id: string, role: 'USER' | 'ADMIN' | 'EDITOR' | 'MODERATOR') {
    const user = await prisma.user.update({ where: { id }, data: { role } }).catch(() => null);
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User tidak ditemukan.' });
    return { id: user.id, email: user.email, role: user.role };
  }

  // ---------- Content ↔ Product mappings ----------
  async upsertContentProduct(input: ContentProductInput) {
    const [content, product] = await Promise.all([
      prisma.content.findUnique({ where: { id: input.contentId } }),
      prisma.product.findUnique({ where: { id: input.productId } }),
    ]);
    if (!content) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    if (!product) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Produk tidak ditemukan.' });
    const row = await prisma.contentProduct.upsert({
      where: { contentId_productId: { contentId: input.contentId, productId: input.productId } },
      create: {
        contentId: input.contentId,
        productId: input.productId,
        relevanceScore: input.relevanceScore ?? 1.0,
        placement: input.placement ?? 'SIDEBAR',
        sortOrder: input.sortOrder ?? 0,
      },
      update: {
        relevanceScore: input.relevanceScore ?? 1.0,
        placement: input.placement ?? 'SIDEBAR',
        sortOrder: input.sortOrder ?? 0,
      },
    });
    return row;
  }

  async listContentProducts(contentId?: string) {
    const rows = await prisma.contentProduct.findMany({
      where: contentId ? { contentId } : {},
      include: { product: true, content: { select: { title: true, slug: true } } },
      orderBy: [{ contentId: 'asc' }, { relevanceScore: 'desc' }],
    });
    return rows.map((r) => ({
      id: r.id,
      contentId: r.contentId,
      contentTitle: r.content.title,
      productId: r.productId,
      productName: r.product.name,
      placement: r.placement,
      relevanceScore: r.relevanceScore,
      sortOrder: r.sortOrder,
    }));
  }

  async removeContentProduct(id: string) {
    await prisma.contentProduct.deleteMany({ where: { id } });
    return { deleted: true };
  }
}

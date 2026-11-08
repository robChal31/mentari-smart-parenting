import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@mentari/database';
import type { ContentDetailDto, ContentListQuery } from '@mentari/shared';
import {
  contentInclude,
  serializeContentSummary,
  serializeProduct,
} from '../common/serializers/content.serializer';

const PUBLISHED = 'PUBLISHED';

@Injectable()
export class ContentsService {
  async list(query: ContentListQuery & { page: number; limit: number }) {
    const { page, limit } = query;
    const where: Record<string, unknown> = {
      status: PUBLISHED,
      ...(query.type ? { type: query.type } : {}),
      ...(query.featured ? { isFeatured: true } : {}),
      ...(query.category ? { categories: { some: { category: { slug: query.category } } } } : {}),
      ...(query.ageGroup ? { ageGroups: { some: { ageGroup: { slug: query.ageGroup } } } } : {}),
      ...(query.tag ? { tags: { some: { tag: { slug: query.tag } } } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q } },
              { excerpt: { contains: query.q } },
              { tags: { some: { tag: { name: { contains: query.q } } } } },
            ],
          }
        : {}),
    };

    const orderBy =
      query.sort === 'popular' || query.sort === 'most_viewed'
        ? [{ viewCount: 'desc' as const }]
        : query.sort === 'oldest'
          ? [{ publishedAt: 'asc' as const }]
          : [{ publishedAt: 'desc' as const }];

    const [total, rows] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items: rows.map(serializeContentSummary), total, page, limit };
  }

  async featured(limit = 6) {
    const rows = await prisma.content.findMany({
      where: { status: PUBLISHED, isFeatured: true },
      include: contentInclude,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return rows.map(serializeContentSummary);
  }

  async findBySlug(slug: string): Promise<ContentDetailDto | null> {
    const row = await prisma.content.findFirst({
      where: { slug, status: PUBLISHED },
      include: contentInclude,
    });
    if (!row) return null;

    const [relatedRaw, manualProducts] = await Promise.all([
      prisma.content.findMany({
        where: {
          status: PUBLISHED,
          id: { not: row.id },
          OR: [
            { categories: { some: { category: { slug: { in: row.categories.map((r) => r.category.slug) } } } } },
            { ageGroups: { some: { ageGroupId: { in: row.ageGroups.map((r) => r.ageGroupId) } } } },
          ],
        },
        include: contentInclude,
        orderBy: { viewCount: 'desc' },
        take: 4,
      }),
      prisma.contentProduct.findMany({
        where: { contentId: row.id },
        include: { product: { include: { ageGroups: { include: { ageGroup: true } } } } },
        orderBy: [{ placement: 'asc' }, { relevanceScore: 'desc' }, { sortOrder: 'asc' }],
      }),
    ]);

    return {
      ...serializeContentSummary(row),
      body: row.body ?? null,
      videoUrl: row.videoUrl ?? null,
      metaTitle: row.metaTitle ?? null,
      metaDescription: row.metaDescription ?? null,
      recommendedProducts: manualProducts.filter((r) => r.product && (r.product as any).isActive !== false && !(r.product as any).deletedAt).map((r) => serializeProduct(r.product)),
      relatedContents: relatedRaw.map(serializeContentSummary),
    };
  }

  async trackView(contentId: string, userId?: string, input?: { duration?: number; completed?: boolean }) {
    const content = await prisma.content.findUnique({ where: { id: contentId }, select: { id: true } });
    if (!content) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Konten tidak ditemukan.' });
    await Promise.all([
      prisma.content.update({ where: { id: contentId }, data: { viewCount: { increment: 1 } } }),
      prisma.contentView.create({
        data: {
          contentId,
          userId: userId ?? null,
          duration: input?.duration ?? null,
          completedAt: input?.completed ? new Date() : null,
        },
      }),
    ]);
    return { tracked: true };
  }
}

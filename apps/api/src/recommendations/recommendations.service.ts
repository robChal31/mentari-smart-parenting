import { Injectable } from '@nestjs/common';
import { prisma } from '@mentari/database';
import type { RecommendationDto } from '@mentari/shared';
import { serializeProduct } from '../common/serializers/content.serializer';

/**
 * Recommendation strategy (priority order, per PRD §F3):
 *  1. Manual content↔product mappings (ContentProduct) — highest priority
 *  2. Products overlapping the content's age groups
 *  3. Featured products (fallback)
 */
@Injectable()
export class RecommendationsService {
  async forContent(contentId: string, limit = 6): Promise<RecommendationDto[]> {
    const manual = await prisma.contentProduct.findMany({
      where: { contentId },
      include: {
        product: { include: { ageGroups: { include: { ageGroup: true } } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { relevanceScore: 'desc' }],
    });

    const results: RecommendationDto[] = manual
      .filter((row) => row.product && row.product.isActive !== false && !row.product.deletedAt)
      .map((row) => ({
        product: serializeProduct(row.product),
        placement: row.placement as RecommendationDto['placement'],
        relevanceScore: row.relevanceScore,
        source: 'manual',
      }));

    const needed = limit - results.length;
    if (needed <= 0) return results.slice(0, limit);

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { ageGroups: true },
    });
    const ageGroupIds = content?.ageGroups.map((row) => row.ageGroupId) ?? [];

    const existingIds = new Set(results.map((r) => r.product.id));

    if (ageGroupIds.length > 0) {
      const matches = await prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          id: { notIn: [...existingIds] },
          ageGroups: { some: { ageGroupId: { in: ageGroupIds } } },
        },
        include: { ageGroups: { include: { ageGroup: true } } },
        orderBy: [{ sortOrder: 'asc' }],
        take: needed,
      });
      for (const product of matches) {
        results.push({
          product: serializeProduct(product),
          placement: 'SIDEBAR',
          relevanceScore: 0.6,
          source: 'age_group',
        });
        existingIds.add(product.id);
      }
    }

    const remaining = limit - results.length;
    if (remaining > 0) {
      const featured = await prisma.product.findMany({
        where: { isActive: true, deletedAt: null, isFeatured: true, id: { notIn: [...existingIds] } },
        include: { ageGroups: { include: { ageGroup: true } } },
        orderBy: [{ sortOrder: 'asc' }],
        take: remaining,
      });
      for (const product of featured) {
        results.push({
          product: serializeProduct(product),
          placement: 'SIDEBAR',
          relevanceScore: 0.4,
          source: 'featured',
        });
      }
    }

    return results.slice(0, limit);
  }

  /** Products recommended for a user based on their children's age groups. */
  async personalized(userId: string, limit = 6): Promise<RecommendationDto[]> {
    const children = await prisma.child.findMany({ where: { userId } });
    const now = new Date();
    const months = children.map((child) => {
      const birth = new Date(child.birthDate);
      return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    });
    const ageGroups = await prisma.ageGroup.findMany();
    const targetGroupIds = new Set<string>();
    for (const m of months) {
      for (const ag of ageGroups) {
        if (m >= ag.minAge && m < ag.maxAge) targetGroupIds.add(ag.id);
      }
    }
    // "semua-usia" products always relevant
    for (const ag of ageGroups) {
      if (ag.slug === 'semua-usia') targetGroupIds.add(ag.id);
    }

    const products = targetGroupIds.size
      ? await prisma.product.findMany({
          where: { isActive: true, deletedAt: null, ageGroups: { some: { ageGroupId: { in: [...targetGroupIds] } } } },
          include: { ageGroups: { include: { ageGroup: true } } },
          orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
          take: limit,
        })
      : await prisma.product.findMany({
          where: { isActive: true, deletedAt: null, isFeatured: true },
          include: { ageGroups: { include: { ageGroup: true } } },
          orderBy: [{ sortOrder: 'asc' }],
          take: limit,
        });

    return products.map((product) => ({
      product: serializeProduct(product),
      placement: 'SIDEBAR' as const,
      relevanceScore: 0.7,
      source: 'age_group' as const,
    }));
  }
}

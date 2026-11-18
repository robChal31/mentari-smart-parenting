import { Injectable } from '@nestjs/common';
import { prisma } from '@mentari/database';
import type { ProductDto, RecommendationDto } from '@mentari/shared';
import { serializeProduct } from '../common/serializers/content.serializer';

/**
 * Rekomendasi produk untuk sebuah konten.
 *
 * Aturan (permintaan produk, bukan sekadar default):
 *   1. Kalau konten punya mapping manual (dipilih saat create/edit konten),
 *      mapping itu yang dipakai — TIDAK ditambah apa pun lagi.
 *   2. Kalau tidak ada mapping, ambil produk yang rentang usianya beririsan
 *      dengan rentang usia yang dipilih di konten.
 *   3. Kalau konten belum punya usia sama sekali (atau tidak ada produk yang
 *      cocok), jatuh ke produk unggulan supaya panel tidak kosong.
 *
 * Poin 1 sengaja tidak menambal hasil manual dengan hasil usia: campuran
 * keduanya membuat kurasi editor tidak bisa diprediksi.
 */
@Injectable()
export class RecommendationsService {
  /**
   * @param contentId id konten
   * @param limit     jumlah maksimum yang dikembalikan
   */
  async forContent(contentId: string, limit = 6): Promise<RecommendationDto[]> {
    const manual = await prisma.contentProduct.findMany({
      where: { contentId },
      include: {
        product: { include: { ageGroups: { include: { ageGroup: true } } } },
      },
      orderBy: [{ sortOrder: 'asc' }, { relevanceScore: 'desc' }],
    });

    const manualProducts = manual
      .filter((row) => row.product && row.product.isActive !== false && !row.product.deletedAt)
      .map<RecommendationDto>((row) => ({
        product: serializeProduct(row.product),
        placement: row.placement as RecommendationDto['placement'],
        relevanceScore: row.relevanceScore,
        source: 'manual',
      }));

    // Prioritaskan yang placement-nya SIDEBAR (satu-satunya yang dirender UI),
    // tapi jangan buang sisanya — urutan tetap deterministik.
    manualProducts.sort((a, b) => {
      if (a.placement === b.placement) return 0;
      if (a.placement === 'SIDEBAR') return -1;
      if (b.placement === 'SIDEBAR') return 1;
      return 0;
    });

    if (manualProducts.length > 0) return manualProducts.slice(0, limit);

    const byAge = await this.byContentAgeGroups(contentId, limit);
    if (byAge.length > 0) return byAge;

    return this.featuredFallback(limit);
  }

  /** Produk yang age group-nya beririsan dengan age group konten. */
  private async byContentAgeGroups(contentId: string, limit: number): Promise<RecommendationDto[]> {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: { ageGroups: { select: { ageGroupId: true } } },
    });
    const ageGroupIds = content?.ageGroups.map((row) => row.ageGroupId) ?? [];
    if (ageGroupIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ageGroups: { some: { ageGroupId: { in: ageGroupIds } } },
      },
      include: { ageGroups: { include: { ageGroup: true } } },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      take: limit,
    });

    return products.map((product) => ({
      product: serializeProduct(product),
      placement: 'SIDEBAR' as const,
      relevanceScore: 0.6,
      source: 'age_group' as const,
    }));
  }

  private async featuredFallback(limit: number): Promise<RecommendationDto[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true, deletedAt: null, isFeatured: true },
      include: { ageGroups: { include: { ageGroup: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: limit,
    });
    return products.map((product) => ({
      product: serializeProduct(product),
      placement: 'SIDEBAR' as const,
      relevanceScore: 0.4,
      source: 'featured' as const,
    }));
  }

  /**
   * Produk untuk seorang user, berdasarkan usia anak-anaknya.
   *
   * CATATAN: saat ini tidak dipanggil dari web (hanya tersedia sebagai
   * endpoint). Dibiarkan apa adanya kecuali deduplikasi: anak dengan usia
   * yang sama tidak boleh membuat produk yang sama muncul dua kali.
   */
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

    const seen = new Set<string>();
    const results: RecommendationDto[] = [];
    for (const product of products) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      results.push({
        product: serializeProduct(product) as ProductDto,
        placement: 'SIDEBAR',
        relevanceScore: 0.7,
        source: 'age_group',
      });
    }
    return results;
  }
}

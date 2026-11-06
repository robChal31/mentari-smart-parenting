import type {
  AgeGroupDto,
  CategoryDto,
  ContentSummaryDto,
  ContentCategoryDto,
  ProductDto,
  LearningPathDto,
  ThreadDto,
  CommentDto,
  ChildDto,
} from '@mentari/shared';
import { ageGroupSlugForMonths, ageInMonths, ageLabel } from '@mentari/shared';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma rows come from either the sqlite (string enums) or mysql (enum) schema —
// serialize structurally instead of against generated types.

export function serializeAgeGroup(ag: any): AgeGroupDto {
  return {
    id: ag.id, name: ag.name, slug: ag.slug,
    minAge: ag.minAge, maxAge: ag.maxAge, description: ag.description ?? null,
  };
}

export function serializeCategory(cat: any): CategoryDto {
  return {
    id: cat.id, name: cat.name, slug: cat.slug,
    description: cat.description ?? null, color: cat.color ?? null, icon: cat.icon ?? null,
    parentId: cat.parentId ?? null, sortOrder: cat.sortOrder ?? 0,
    ...(cat.children ? { children: cat.children.map(serializeCategory) } : {}),
    ...(cat._count?.contents !== undefined ? { contentCount: cat._count.contents } : {}),
  };
}

function parseImages(raw: unknown): string[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as string[];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeProduct(p: any): ProductDto {
  return {
    id: p.id, name: p.name, slug: p.slug,
    description: p.description ?? null,
    shortDescription: p.shortDescription ?? null,
    type: p.type,
    price: p.price === null || p.price === undefined ? null : Number(p.price),
    currency: p.currency ?? 'IDR',
    thumbnailUrl: p.thumbnailUrl ?? null,
    images: parseImages(p.images),
    externalUrl: p.externalUrl ?? null,
    ctaText: p.ctaText ?? null,
    isFeatured: Boolean(p.isFeatured),
    sortOrder: p.sortOrder ?? 0,
    ageGroups: p.ageGroups?.map((ag: any) => serializeAgeGroup(ag.ageGroup ?? ag)),
  };
}

export function serializeContentSummary(c: any): ContentSummaryDto {
  const categories: ContentCategoryDto[] = (c.categories ?? []).map((row: any) => ({
    name: (row.category ?? row).name,
    slug: (row.category ?? row).slug,
    color: (row.category ?? row).color ?? null,
  }));
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    excerpt: c.excerpt ?? null,
    type: c.type,
    thumbnailUrl: c.thumbnailUrl ?? null,
    videoDuration: c.videoDuration ?? null,
    readTime: c.readTime ?? null,
    viewCount: c.viewCount ?? 0,
    likeCount: c.likeCount ?? 0,
    isFeatured: Boolean(c.isFeatured),
    isPremium: Boolean(c.isPremium),
    authorName: c.authorName ?? null,
    authorTitle: c.authorTitle ?? null,
    publishedAt: c.publishedAt ? new Date(c.publishedAt).toISOString() : null,
    categories,
    ageGroups: (c.ageGroups ?? []).map((row: any) => ({
      name: (row.ageGroup ?? row).name,
      slug: (row.ageGroup ?? row).slug,
    })),
    tags: (c.tags ?? []).map((row: any) => (row.tag ?? row).name),
  };
}

export const contentInclude = {
  categories: { include: { category: true } },
  ageGroups: { include: { ageGroup: true } },
  tags: { include: { tag: true } },
} as const;

export function serializeLearningPath(p: any, includeItems = false): LearningPathDto {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description ?? null,
    thumbnailUrl: p.thumbnailUrl ?? null,
    difficulty: p.difficulty,
    estimatedTime: p.estimatedTime ?? null,
    ...(includeItems && p.items
      ? {
          items: p.items.map((item: any) => ({
            id: item.id,
            sortOrder: item.sortOrder,
            isRequired: item.isRequired,
            content: serializeContentSummary(item.content),
          })),
        }
      : {}),
  };
}

export function serializeChild(child: any, now = new Date()): ChildDto {
  const birth = new Date(child.birthDate);
  const months = ageInMonths(birth, now);
  return {
    id: child.id,
    name: child.name,
    birthDate: birth.toISOString(),
    gender: child.gender ?? null,
    avatarUrl: child.avatarUrl ?? null,
    ageMonths: months,
    ageLabel: ageLabel(birth, now),
    ageGroupSlug: ageGroupSlugForMonths(months),
  };
}

export function serializeThread(t: any): ThreadDto {
  return {
    id: t.id,
    title: t.title,
    body: t.body,
    isPinned: Boolean(t.isPinned),
    isLocked: Boolean(t.isLocked),
    viewCount: t.viewCount ?? 0,
    likeCount: t.likeCount ?? 0,
    commentCount: t.commentCount ?? 0,
    createdAt: new Date(t.createdAt).toISOString(),
    author: {
      fullName: t.user?.fullName ?? 'Anonim',
      avatarUrl: t.user?.avatarUrl ?? null,
    },
    categoryName: t.categorySlug ?? null,
    categorySlug: t.categorySlug ?? null,
  };
}

export function serializeComment(c: any): CommentDto {
  return {
    id: c.id,
    body: c.body,
    likeCount: c.likeCount ?? 0,
    createdAt: new Date(c.createdAt).toISOString(),
    author: {
      fullName: c.user?.fullName ?? 'Anonim',
      avatarUrl: c.user?.avatarUrl ?? null,
    },
    parentId: c.parentId ?? null,
  };
}

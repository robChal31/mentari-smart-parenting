// ============================================================
// MentariSmartParent — Shared Zod Validators
// Used by apps/api (request validation) and apps/web (form validation)
// ============================================================
import { z } from 'zod';
import { CONTENT_TYPES, MILESTONE_CATEGORIES, PRODUCT_TYPES, RECOMMENDATION_PLACEMENTS } from '../constants';

export const uuidSchema = z.string().uuid();

// ---------- Auth ----------
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(30).nullish(),
  avatarUrl: z.string().url().nullish(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ---------- Children ----------
export const childSchema = z.object({
  name: z.string().min(1, 'Nama anak wajib diisi').max(80),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Tanggal lahir tidak valid'),
  gender: z.enum(['MALE', 'FEMALE']).nullish(),
  avatarUrl: z.string().url().nullish(),
});
export type ChildInput = z.infer<typeof childSchema>;

// ---------- Content (admin) ----------
export const createContentSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
  slug: z.string().min(3).max(220).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung').optional(),
  excerpt: z.string().max(500).nullish(),
  body: z.string().nullish(),
  type: z.enum(CONTENT_TYPES),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).default('DRAFT'),
  thumbnailUrl: z.string().max(1000).nullish(),
  videoUrl: z.string().max(1000).nullish(),
  videoDuration: z.number().int().min(0).nullish(),
  readTime: z.number().int().min(0).nullish(),
  isFeatured: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  authorName: z.string().max(120).nullish(),
  authorTitle: z.string().max(120).nullish(),
  authorAvatarUrl: z.string().max(1000).nullish(),
  metaTitle: z.string().max(200).nullish(),
  metaDescription: z.string().max(400).nullish(),
  publishedAt: z.string().datetime({ offset: true }).nullish(),
  categorySlugs: z.array(z.string()).default([]),
  ageGroupSlugs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});
export type CreateContentInput = z.infer<typeof createContentSchema>;
export const updateContentSchema = createContentSchema.partial();
export type UpdateContentInput = z.infer<typeof updateContentSchema>;

// ---------- Product (admin) ----------
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(3).max(220).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(5000).nullish(),
  shortDescription: z.string().max(300).nullish(),
  type: z.enum(PRODUCT_TYPES),
  price: z.number().min(0).nullish(),
  currency: z.string().default('IDR'),
  thumbnailUrl: z.string().max(1000).nullish(),
  images: z.array(z.string()).nullish(),
  externalUrl: z.string().max(1000).nullish(),
  ctaText: z.string().max(60).nullish(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  ageGroupSlugs: z.array(z.string()).default([]),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;
export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ---------- Category (admin) ----------
export const createCategorySchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).nullish(),
  color: z.string().max(20).nullish(),
  icon: z.string().max(60).nullish(),
  parentId: uuidSchema.nullish(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ---------- Learning Path (admin) ----------
export const learningPathItemInputSchema = z.object({
  contentId: uuidSchema,
  sortOrder: z.number().int().min(0).default(0),
  isRequired: z.boolean().default(true),
});
export type LearningPathItemInput = z.infer<typeof learningPathItemInputSchema>;

export const createLearningPathSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  slug: z.string().min(3).max(220).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung').optional(),
  description: z.string().max(5000).nullish(),
  thumbnailUrl: z.string().max(1000).nullish(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
  estimatedTime: z.number().int().min(1).max(100000).nullish(),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  items: z.array(learningPathItemInputSchema).max(200).default([]),
});
export type CreateLearningPathInput = z.infer<typeof createLearningPathSchema>;
export const updateLearningPathSchema = createLearningPathSchema.partial();
export type UpdateLearningPathInput = z.infer<typeof updateLearningPathSchema>;

// ---------- Content-Product mapping (admin) ----------
export const contentProductSchema = z.object({
  contentId: uuidSchema,
  productId: uuidSchema,
  relevanceScore: z.number().min(0).max(1).default(1.0),
  placement: z.enum(RECOMMENDATION_PLACEMENTS).default('SIDEBAR'),
  sortOrder: z.number().int().default(0),
});
export type ContentProductInput = z.infer<typeof contentProductSchema>;

// ---------- Bookmarks ----------
export const bookmarkSchema = z.object({
  contentId: uuidSchema,
});
export type BookmarkInput = z.infer<typeof bookmarkSchema>;

// ---------- Analytics ----------
export const productClickSchema = z.object({
  productId: uuidSchema,
  contentId: uuidSchema.nullish(),
  source: z.enum(RECOMMENDATION_PLACEMENTS).or(z.string().max(40)).nullish(),
});
export type ProductClickInput = z.infer<typeof productClickSchema>;

export const trackViewSchema = z.object({
  duration: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});
export type TrackViewInput = z.infer<typeof trackViewSchema>;

// ---------- Community ----------
export const createThreadSchema = z.object({
  title: z.string().min(8, 'Judul minimal 8 karakter').max(200),
  body: z.string().min(20, 'Tulisan minimal 20 karakter').max(10000),
  categorySlug: z.string().max(140).nullish(),
});
export type CreateThreadInput = z.infer<typeof createThreadSchema>;

export const createCommentSchema = z.object({
  body: z.string().min(2, 'Komentar minimal 2 karakter').max(5000),
  parentId: uuidSchema.nullish(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ---------- Milestones (admin / tracking) ----------
export const createMilestoneSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(1000).nullish(),
  ageGroupSlug: z.string(),
  category: z.enum(MILESTONE_CATEGORIES),
  sortOrder: z.number().int().default(0),
});
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

export const toggleMilestoneSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().max(2000).nullish(),
});
export type ToggleMilestoneInput = z.infer<typeof toggleMilestoneSchema>;

// ---------- Pagination / listing ----------
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

// ---------- Utility ----------
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

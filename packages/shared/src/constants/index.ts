// ============================================================
// MentariSmartParent — Shared Constants
// ============================================================

export const BRAND = {
  name: 'MentariSmartParent',
  tagline: 'Tumbuh Bersama, Belajar Bersama',
  company: 'Mentari Group',
  primary: '#FF6B35',
  secondary: '#004E89',
  accent: '#2EC4B6',
  success: '#06D6A0',
  warning: '#FFD166',
  error: '#EF476F',
} as const;

export const AGE_GROUPS = [
  { slug: 'bayi', name: 'Bayi (0-12 Bulan)', minAge: 0, maxAge: 12 },
  { slug: 'batita', name: 'Batita (1-3 Tahun)', minAge: 12, maxAge: 36 },
  { slug: 'prasekolah', name: 'Prasekolah (3-6 Tahun)', minAge: 36, maxAge: 72 },
  { slug: 'sd-awal', name: 'SD Awal (6-9 Tahun)', minAge: 72, maxAge: 108 },
  { slug: 'sd-akhir', name: 'SD Akhir (9-12 Tahun)', minAge: 108, maxAge: 144 },
  { slug: 'semua-usia', name: 'Semua Usia', minAge: 0, maxAge: 144 },
] as const;

export type AgeGroupSlug = (typeof AGE_GROUPS)[number]['slug'];

export const CONTENT_TYPES = ['VIDEO', 'ARTICLE', 'INFOGRAPHIC', 'TIPS', 'ACTIVITY'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  VIDEO: 'Video',
  ARTICLE: 'Artikel',
  INFOGRAPHIC: 'Infografis',
  TIPS: 'Tips',
  ACTIVITY: 'Aktivitas',
};

export const PRODUCT_TYPES = [
  'BOOK_NATIONAL',
  'BOOK_INTERNATIONAL',
  'BOOK_SELF_PUBLISHED',
  'BOOK_STORYBOOK',
  'DIGITAL_LEARNING',
  'ENGLISH_ASSESSMENT',
  'TEACHER_ACADEMY',
  'OTHER',
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  BOOK_NATIONAL: 'Buku Kurikulum Nasional',
  BOOK_INTERNATIONAL: 'Buku Kurikulum Internasional',
  BOOK_SELF_PUBLISHED: 'Buku Terbitan Sendiri',
  BOOK_STORYBOOK: 'Buku Dongeng & Cerita',
  DIGITAL_LEARNING: 'Digital Learning',
  ENGLISH_ASSESSMENT: 'English Assessment',
  TEACHER_ACADEMY: 'Teacher Academy',
  OTHER: 'Lainnya',
};

export const RECOMMENDATION_PLACEMENTS = ['SIDEBAR', 'INLINE', 'BOTTOM', 'OVERLAY', 'BANNER'] as const;
export type RecommendationPlacement = (typeof RECOMMENDATION_PLACEMENTS)[number];

export const MILESTONE_CATEGORIES = ['COGNITIVE', 'PHYSICAL', 'SOCIAL_EMOTIONAL', 'LANGUAGE', 'CREATIVE'] as const;
export type MilestoneCategory = (typeof MILESTONE_CATEGORIES)[number];

export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  COGNITIVE: 'Kognitif',
  PHYSICAL: 'Fisik & Motorik',
  SOCIAL_EMOTIONAL: 'Sosial & Emosional',
  LANGUAGE: 'Bahasa',
  CREATIVE: 'Kreativitas',
};

/** Map a child's age in months to an age-group slug ("semua-usia" excluded — it spans everything). */
export function ageGroupSlugForMonths(months: number): AgeGroupSlug {
  if (months < 12) return 'bayi';
  if (months < 36) return 'batita';
  if (months < 72) return 'prasekolah';
  if (months < 108) return 'sd-awal';
  return 'sd-akhir';
}

/** Age in whole months from a birthdate, clamped at 0. */
export function ageInMonths(birthDate: Date, now: Date = new Date()): number {
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth()) -
    (now.getDate() < birthDate.getDate() ? 1 : 0);
  return Math.max(0, months);
}

/** Human readable Indonesian age label, e.g. "2 tahun 4 bulan". */
export function ageLabel(birthDate: Date, now: Date = new Date()): string {
  const total = ageInMonths(birthDate, now);
  const years = Math.floor(total / 12);
  const months = total % 12;
  if (years === 0) return `${months} bulan`;
  if (months === 0) return `${years} tahun`;
  return `${years} tahun ${months} bulan`;
}

export const DIFFICULTY_LABELS = {
  BEGINNER: 'Pemula',
  INTERMEDIATE: 'Menengah',
  ADVANCED: 'Lanjutan',
} as const;

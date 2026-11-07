// ============================================================
// MentariSmartParent — Shared API Types
// These DTOs describe the JSON contract between apps/api and apps/web.
// ============================================================
import type { ContentType, MilestoneCategory, ProductType, RecommendationPlacement } from '../constants';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

// ---------- Age Groups ----------
export interface AgeGroupDto {
  id: string;
  name: string;
  slug: string;
  minAge: number;
  maxAge: number;
  description?: string | null;
}

// ---------- Categories ----------
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
  sortOrder: number;
  children?: CategoryDto[];
  contentCount?: number;
}

// ---------- Tags ----------
export interface TagDto {
  id: string;
  name: string;
  slug: string;
}

// ---------- Products ----------
export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  type: ProductType;
  price?: number | null;
  currency: string;
  thumbnailUrl?: string | null;
  images?: string[] | null;
  externalUrl?: string | null;
  ctaText?: string | null;
  isFeatured: boolean;
  isActive?: boolean;
  deletedAt?: string | null;
  sortOrder: number;
  ageGroups?: AgeGroupDto[];
}

// ---------- Contents ----------
export interface ContentCategoryDto {
  name: string;
  slug: string;
  color?: string | null;
}

export interface ContentSummaryDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  type: ContentType;
  thumbnailUrl?: string | null;
  videoDuration?: number | null;
  readTime?: number | null;
  viewCount: number;
  likeCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  authorName?: string | null;
  authorTitle?: string | null;
  publishedAt?: string | null;
  categories: ContentCategoryDto[];
  ageGroups: { name: string; slug: string }[];
  tags: string[];
}

export interface ContentDetailDto extends ContentSummaryDto {
  body?: string | null;
  videoUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  recommendedProducts: ProductDto[];
  relatedContents: ContentSummaryDto[];
}

export interface ContentListQuery {
  q?: string;
  type?: ContentType;
  category?: string;
  ageGroup?: string;
  tag?: string;
  featured?: boolean;
  sort?: 'latest' | 'popular' | 'most_viewed' | 'oldest';
  page?: number;
  limit?: number;
}

// ---------- Recommendations ----------
export interface RecommendationDto {
  product: ProductDto;
  placement: RecommendationPlacement;
  relevanceScore: number;
  source: 'manual' | 'age_group' | 'category' | 'featured';
}

// ---------- Auth / Users ----------
export interface PublicUserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN' | 'EDITOR' | 'MODERATOR';
  createdAt: string;
}

export interface AuthPayloadDto {
  accessToken: string;
  user: PublicUserDto;
}

// ---------- Children ----------
export interface ChildDto {
  id: string;
  name: string;
  birthDate: string;
  gender?: 'MALE' | 'FEMALE' | null;
  avatarUrl?: string | null;
  ageMonths: number;
  ageLabel: string;
  ageGroupSlug: string;
}

// ---------- Milestones ----------
export interface MilestoneDto {
  id: string;
  title: string;
  description?: string | null;
  category: MilestoneCategory;
  ageGroupSlug: string;
  sortOrder: number;
}

// ---------- Gamification ----------
export interface GamificationDto {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  lastActiveDate?: string | null;
  badges: { id: string; name: string; slug: string; description?: string | null; points: number; earnedAt: string }[];
}

// ---------- Bookmarks ----------
export interface BookmarkDto {
  id: string;
  createdAt: string;
  content: ContentSummaryDto;
}

// ---------- Learning Paths ----------
export interface LearningPathItemDto {
  id: string;
  sortOrder: number;
  isRequired: boolean;
  content: ContentSummaryDto;
}

export interface LearningPathDto {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedTime?: number | null;
  items?: LearningPathItemDto[];
}

// ---------- Community ----------
export interface ThreadDto {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: { fullName: string; avatarUrl?: string | null };
  categoryName?: string | null;
  categorySlug?: string | null;
}

export interface CommentDto {
  id: string;
  body: string;
  likeCount: number;
  createdAt: string;
  author: { fullName: string; avatarUrl?: string | null };
  parentId?: string | null;
}

// ---------- Analytics (admin) ----------
export interface AdminOverviewDto {
  totalUsers: number;
  totalContents: number;
  publishedContents: number;
  totalProducts: number;
  totalViews: number;
  totalProductClicks: number;
  totalBookmarks: number;
  totalThreads: number;
  newUsersLast30d: number;
  topContents: { title: string; slug: string; viewCount: number; type: ContentType }[];
  topProducts: { name: string; slug: string; clicks: number }[];
  viewsByDay: { date: string; views: number }[];
}

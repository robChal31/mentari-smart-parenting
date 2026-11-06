// Server-side API helpers (SSR / generateMetadata / server components).
// The browser talks to same-origin /api/v1/* (proxied by Next rewrites);
// the server talks directly to the API process via API_INTERNAL_URL.
import type {
  AgeGroupDto,
  ApiResponse,
  CategoryDto,
  ChildDto,
  ContentDetailDto,
  ContentSummaryDto,
  LearningPathDto,
  ProductDto,
  ThreadDto,
  PaginationMeta,
} from "@mentari/shared";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta | null;
}

async function fetchServer<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_INTERNAL}/api/v1${path}`, {
      cache: "no-store",
      ...init,
    });
    const body = (await res.json()) as ApiResponse<T> | { success: true; data: T; meta?: PaginationMeta };
    if (!res.ok || !("success" in body) || body.success !== true) return null;
    return (body as { data: T }).data;
  } catch {
    return null;
  }
}

async function fetchServerPaginated<T>(path: string): Promise<Paginated<T>> {
  try {
    const res = await fetch(`${API_INTERNAL}/api/v1${path}`, { cache: "no-store" });
    const body = (await res.json()) as { success: true; data: T[]; meta?: PaginationMeta };
    if (!res.ok || body.success !== true) return { items: [], meta: null };
    return { items: body.data, meta: body.meta ?? null };
  } catch {
    return { items: [], meta: null };
  }
}

function qs(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export const api = {
  categories: () => fetchServer<CategoryDto[]>("/categories"),
  ageGroups: () => fetchServer<AgeGroupDto[]>("/age-groups"),
  contents: (params: Record<string, string | undefined>) =>
    fetchServerPaginated<ContentSummaryDto>(`/contents${qs(params)}`),
  contentsFeatured: (limit = 4) => fetchServer<ContentSummaryDto[]>(`/contents/featured?limit=${limit}`),
  contentBySlug: (slug: string) => fetchServer<ContentDetailDto>(`/contents/${encodeURIComponent(slug)}`),
  search: (params: Record<string, string | undefined>) =>
    fetchServerPaginated<ContentSummaryDto>(`/search${qs(params)}`),
  products: (params: Record<string, string | undefined> = {}) =>
    fetchServer<ProductDto[]>(`/products${qs(params)}`),
  productBySlug: (slug: string) => fetchServer<ProductDto>(`/products/${encodeURIComponent(slug)}`),
  learningPaths: () => fetchServer<LearningPathDto[]>("/learning-paths"),
  learningPathBySlug: (slug: string) => fetchServer<LearningPathDto>(`/learning-paths/${encodeURIComponent(slug)}`),
  threads: (params: Record<string, string | undefined> = {}) =>
    fetchServerPaginated<ThreadDto>(`/community/threads${qs(params)}`),
  threadById: (id: string) => fetchServer<ThreadDto & { comments: import("@mentari/shared").CommentDto[] }>(`/community/threads/${id}`),
};

export { API_INTERNAL };

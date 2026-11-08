// Server-side API helpers (SSR / generateMetadata / server components).
// The browser talks to same-origin /api/v1/* (proxied by Next rewrites);
// the server talks directly to the API process via API_INTERNAL_URL.
import type {
  AgeGroupDto,
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

/**
 * Thrown when the upstream API is unreachable or answers with a non-OK /
 * malformed response. Server components let this bubble to `app/error.tsx`,
 * which renders an honest "something went wrong + retry" screen — instead of
 * a misleading empty state.
 */
export class ApiServerError extends Error {
  constructor(
    public status: number | null,
    message: string,
  ) {
    super(message);
    this.name = "ApiServerError";
  }
}

function parseApiBody(text: string): { success?: boolean; data?: unknown; meta?: PaginationMeta; error?: { message?: string } } | null {
  try {
    return JSON.parse(text) as ReturnType<typeof parseApiBody>;
  } catch {
    return null;
  }
}

async function fetchServer<T>(path: string, init?: RequestInit): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${API_INTERNAL}/api/v1${path}`, {
      cache: "no-store",
      ...init,
    });
  } catch {
    throw new ApiServerError(null, "Tidak dapat terhubung ke server API.");
  }
  const body = parseApiBody(await res.text());
  if (res.status === 404) return null; // genuine "not found" — callers render 404
  if (!res.ok || !body || body.success !== true) {
    throw new ApiServerError(res.status, body?.error?.message ?? "Permintaan gagal.");
  }
  return body.data as T;
}

async function fetchServerPaginated<T>(path: string): Promise<Paginated<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_INTERNAL}/api/v1${path}`, { cache: "no-store" });
  } catch {
    throw new ApiServerError(null, "Tidak dapat terhubung ke server API.");
  }
  const body = parseApiBody(await res.text());
  if (!res.ok || !body || body.success !== true || !Array.isArray(body.data)) {
    throw new ApiServerError(res.status, body?.error?.message ?? "Permintaan gagal.");
  }
  return { items: body.data as T[], meta: body.meta ?? null };
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

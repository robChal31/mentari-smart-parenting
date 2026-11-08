"use client";
// Browser-side API client. Always same-origin relative URLs (proxied by Next rewrites).
export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

const TOKEN_KEY = "mentari.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  const send = () =>
    fetch(`/api/v1${path}`, {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

  const MAX_ATTEMPTS = 2; // initial try + 1 automatic retry for transient failures
  for (let attempt = 1; ; attempt++) {
    let res: Response | null = null;
    try {
      res = await send();
    } catch {
      res = null; // connection refused / offline / timeout
    }

    // Transient network/gateway failure → wait briefly and retry once.
    if (res === null || RETRYABLE_STATUS.has(res.status)) {
      if (attempt < MAX_ATTEMPTS) {
        await delay(500);
        continue;
      }
      throw new ApiError(
        res?.status ?? 0,
        "NETWORK_ERROR",
        "Koneksi bermasalah. Periksa internet Anda, lalu coba lagi.",
      );
    }

    let body: { success?: boolean; data?: T; meta?: ApiEnvelope<T>["meta"]; error?: { code?: string; message?: string } } | null = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok || !body?.success) {
      throw new ApiError(
        res.status,
        body?.error?.code ?? "REQUEST_FAILED",
        body?.error?.message ?? "Permintaan gagal. Coba lagi.",
      );
    }
    return body as ApiEnvelope<T>;
  }
}

/** Unwrap `data` from the envelope. */
export async function apiData<T>(
  path: string,
  options?: { method?: string; body?: unknown; auth?: boolean },
): Promise<T> {
  const envelope = await request<T>(path, options);
  return envelope.data;
}

/** Full envelope including pagination meta. */
export async function apiPaginated<T>(
  path: string,
  options?: { method?: string; body?: unknown; auth?: boolean },
): Promise<ApiEnvelope<T[]>> {
  return request<T[]>(path, options);
}

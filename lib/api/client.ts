/**
 * Typed fetch wrapper for the Django API.
 *
 * Security model (see ARCHITECTURE.md):
 * - Tokens live only in HttpOnly cookies — never touched by this client.
 * - Every request uses credentials: 'include' so the browser attaches cookies.
 * - Mutations send X-CSRFToken from the readable `csrftoken` cookie
 *   (double-submit cookie pattern; value is NOT taken from a JSON body).
 * - On 401, a single-flight silent refresh runs; concurrent 401s share it.
 */

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiClientOptions = {
  baseUrl?: string;
  onUnauthorized?: () => void;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip the silent-refresh retry (used by refresh itself). */
  skipRefresh?: boolean;
  /** Skip attaching the CSRF header (safe for GET/HEAD). */
  skipCsrf?: boolean;
};

const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api/v1";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

/** Django's default CSRF cookie name (`CSRF_COOKIE_NAME`). */
export const CSRF_COOKIE_NAME = "csrftoken";

/** Header Django expects (`CSRF_HEADER_NAME` → HTTP_X_CSRFTOKEN). */
export const CSRF_HEADER_NAME = "X-CSRFToken";

/**
 * Read a cookie from `document.cookie`.
 * Only works for non-HttpOnly cookies (csrftoken is readable by design;
 * auth JWTs are HttpOnly and intentionally invisible here).
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiClient {
  private baseUrl: string;
  private onUnauthorized?: () => void;

  /**
   * Single-flight lock for silent refresh.
   *
   * When N parallel requests all receive 401, only the first creates this
   * promise; the rest await the same instance. That prevents concurrent
   * POSTs to /auth/refresh/, which would rotate+blacklist the refresh
   * token family and leave all but one caller with a dead token.
   *
   * After the shared refresh settles, each waiter retries its original
   * request once with skipRefresh=true.
   */
  private refreshPromise: Promise<boolean> | null = null;

  /** Dedupes concurrent CSRF bootstrap GETs the same way. */
  private csrfPromise: Promise<void> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE;
    this.onUnauthorized = options.onUnauthorized;
  }

  setUnauthorizedHandler(handler: (() => void) | undefined) {
    this.onUnauthorized = handler;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      body,
      skipRefresh = false,
      skipCsrf = false,
      headers: initHeaders,
      ...rest
    } = options;

    const method = (rest.method ?? "GET").toUpperCase();
    const headers = new Headers(initHeaders);
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;

    if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!skipCsrf && !SAFE_METHODS.has(method)) {
      await this.ensureCsrfCookie();
      const csrf = getCookie(CSRF_COOKIE_NAME);
      if (csrf) {
        headers.set(CSRF_HEADER_NAME, csrf);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...rest,
      method,
      headers,
      credentials: "include",
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });

    if (response.status === 401 && !skipRefresh) {
      // All concurrent 401s park on the same refreshPromise (single-flight).
      const refreshed = await this.refreshOnce();
      if (refreshed) {
        return this.request<T>(path, { ...options, skipRefresh: true });
      }
      // onUnauthorized is invoked once inside refreshOnce on failure —
      // do not call it again per waiter.
      throw new ApiError(401, await safeJson(response), "Unauthorized");
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        await safeJson(response),
        `API error ${response.status}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * Ensures the Django `csrftoken` cookie exists before a mutation.
   * Triggered by GET /auth/csrf/ (ensure_csrf_cookie) — the JSON body is
   * ignored; only the Set-Cookie side effect matters. Concurrent callers
   * share one in-flight bootstrap request.
   */
  async ensureCsrfCookie(): Promise<void> {
    if (getCookie(CSRF_COOKIE_NAME)) return;

    if (!this.csrfPromise) {
      this.csrfPromise = this.fetchCsrfCookie().finally(() => {
        this.csrfPromise = null;
      });
    }
    await this.csrfPromise;
  }

  private async fetchCsrfCookie(): Promise<void> {
    await fetch(`${this.baseUrl}/auth/csrf/`, {
      method: "GET",
      credentials: "include",
    });
  }

  /**
   * Single-flight refresh: first 401 starts the work; later 401s await it.
   * On failure, notifies the session store exactly once.
   */
  private refreshOnce(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh()
        .then((ok) => {
          if (!ok) {
            this.onUnauthorized?.();
          }
          return ok;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<boolean> {
    try {
      // Refresh is a POST; attach CSRF if available (RefreshView itself
      // disables CookieJWTAuthentication, but middleware / future changes
      // are safer if the header is always present).
      await this.ensureCsrfCookie();
      const headers = new Headers();
      const csrf = getCookie(CSRF_COOKIE_NAME);
      if (csrf) {
        headers.set(CSRF_HEADER_NAME, csrf);
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
        headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const apiClient = new ApiClient();

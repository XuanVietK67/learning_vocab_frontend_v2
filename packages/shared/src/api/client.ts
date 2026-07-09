/**
 * Transport-agnostic HTTP client for the NestJS backend.
 *
 * Pure `fetch` — runs on the Next.js server AND in React Native. No platform
 * imports (`next/headers`, cookies, DOM). The base URL is injected per platform
 * via `createApiRequest`; authenticated calls layer on top in `./authed`.
 */

/** Standard Nest error body — `message` is a string or an array of strings. */
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  [key: string]: unknown;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: ApiErrorBody | null;
}

/** First human-readable message from a Nest error body. */
export function firstMessage(error: ApiErrorBody | null): string | null {
  if (!error) return null;
  const { message } = error;
  if (Array.isArray(message)) return message[0] ?? null;
  return typeof message === "string" ? message : null;
}

export type ApiRequest = <T>(
  path: string,
  init?: RequestInit,
  token?: string | null,
) => Promise<ApiResult<T>>;

/** Bind an `apiRequest` to a base URL. Unauthenticated by default; pass a token to attach it. */
export function createApiRequest(baseUrl: string): ApiRequest {
  return async function apiRequest<T>(
    path: string,
    init?: RequestInit,
    token?: string | null,
  ): Promise<ApiResult<T>> {
    // Let the runtime set the multipart boundary for FormData bodies (file
    // uploads); only default to JSON for everything else.
    const isFormData =
      typeof FormData !== "undefined" && init?.body instanceof FormData;

    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });

    const body = await parseBody(res);

    if (res.ok) {
      return { ok: true, status: res.status, data: body as T, error: null };
    }
    return {
      ok: false,
      status: res.status,
      data: null,
      error: toErrorBody(body, res.status),
    };
  };
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toErrorBody(body: unknown, status: number): ApiErrorBody {
  if (body && typeof body === "object") {
    return body as ApiErrorBody;
  }
  return {
    statusCode: status,
    message: typeof body === "string" ? body : "Request failed",
  };
}

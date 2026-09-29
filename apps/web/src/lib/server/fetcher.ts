const API_URL =
  (typeof window === 'undefined' && process.env.API_INTERNAL_URL) ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8080/api/v1';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: { code: string };
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

export function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Something went wrong, please try again.';
}

export type Query = Record<string, string | number | undefined>;

export interface RequestOptions extends RequestInit {
  token?: string;
  query?: Query;
}

export async function request<T>(path: string, { token, query, ...init }: RequestOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}${toSearch(query)}`, { ...init, headers });
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !body?.success) {
    throw new ApiError(res.status, body?.error?.code ?? 'UNKNOWN', body?.message ?? res.statusText);
  }
  return body.data as T;
}

function toSearch(query?: Query) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

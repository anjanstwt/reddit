const API_URL =
    (typeof window === 'undefined' && process.env.API_INTERNAL_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8080/api/v1';

// Mirrors models.User on the server.
export interface ApiUser {
    id: string;
    email: string;
    username: string | null;
    name: string;
    image: string | null;
    avatarMediaId: string | null;
    bio: string;
    followerCount: number;
    followingCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
}

export interface AuthResponse extends AuthTokens {
    user: ApiUser;
}

// Envelope every Go handler responds with (see internal/response).
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

type ApiOptions = RequestInit & { token?: string };

// Calls the API and unwraps the response envelope. Throws ApiError on failure.
export async function api<T>(path: string, { token, ...init }: ApiOptions = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(`${API_URL}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (!res.ok || !body?.success) {
        throw new ApiError(res.status, body?.error?.code ?? 'UNKNOWN', body?.message ?? res.statusText);
    }
    return body.data as T;
}

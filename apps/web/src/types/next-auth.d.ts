import type { AuthResponse, User as ApiUser } from '@/lib/server/types';

declare module 'next-auth' {
  interface Session {
    user: ApiUser;
    accessToken: string;
    error?: 'RefreshTokenError';
  }

  interface User {
    // Set in the signIn callback, consumed once by the jwt callback.
    api?: AuthResponse;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: ApiUser;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    error?: 'RefreshTokenError';
  }
}

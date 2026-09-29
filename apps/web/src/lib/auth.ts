import type { AuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

import { api } from './server/api';
import type { AuthTokens } from './server/types';

// Refresh a little before the access token actually expires.
const REFRESH_MARGIN_MS = 60 * 1000;

function withTokens(token: JWT, tokens: AuthTokens): JWT {
  return {
    ...token,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: Date.parse(tokens.accessTokenExpiresAt),
    error: undefined,
  };
}

async function refreshTokens(token: JWT): Promise<JWT> {
  try {
    const tokens = await api.auth.refresh(token.refreshToken);
    return withTokens(token, tokens);
  } catch {
    return { ...token, error: 'RefreshTokenError' };
  }
}

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    // Hand Google's ID token to the Go server, which verifies it, upserts the
    // user and returns its own tokens. Returning false denies the sign-in.
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !account.id_token) return false;

      try {
        user.api = await api.auth.google(account.id_token);
        return true;
      } catch (err) {
        console.error('google sign-in failed', err);
        return false;
      }
    },

    async jwt({ token, user }) {
      // `user` is only present right after signIn.
      if (user?.api) {
        return withTokens({ ...token, user: user.api.user }, user.api);
      }
      if (Date.now() < token.accessTokenExpiresAt - REFRESH_MARGIN_MS) {
        return token;
      }
      return refreshTokens(token);
    },

    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};

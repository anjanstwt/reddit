'use client';

import { useSession } from 'next-auth/react';

export function useAccessToken() {
  const { data, status } = useSession();
  const authed = status === 'authenticated' && !data?.error;

  return {
    token: authed ? data.accessToken : undefined,
    userId: authed ? data.user.id : undefined,
    ready: status !== 'loading',
  };
}

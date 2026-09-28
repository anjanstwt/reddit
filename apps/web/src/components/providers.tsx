'use client';

import { SessionProvider } from 'next-auth/react';

// Refetching the session runs the jwt callback, which refreshes the
// 15-minute access token before it expires.
const SESSION_REFETCH_SECONDS = 5 * 60;

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchInterval={SESSION_REFETCH_SECONDS}>{children}</SessionProvider>;
}

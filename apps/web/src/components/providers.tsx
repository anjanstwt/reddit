'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

import { ApiError } from '@/lib/server/fetcher';

// Refetching the session runs the jwt callback, which refreshes the
// 15-minute access token before it expires.
const SESSION_REFETCH_SECONDS = 5 * 60;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: (failures, error) => failures < 1 && !(error instanceof ApiError && error.status < 500),
          },
        },
      }),
  );

  return (
    <SessionProvider refetchInterval={SESSION_REFETCH_SECONDS}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

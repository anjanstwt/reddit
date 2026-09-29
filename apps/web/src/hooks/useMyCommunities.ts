'use client';

import { useQuery } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';

export function useMyCommunities() {
  const { token, userId } = useAccessToken();

  return useQuery({
    queryKey: keys.myCommunities(userId),
    queryFn: () => api.users.communities({ limit: 100 }, token!),
    enabled: !!token,
  });
}

'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';

export function useUserSearch(q: string) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.userSearch(q, userId),
    queryFn: () => api.users.search({ q, limit: 50 }, token),
    enabled: ready,
    placeholderData: keepPreviousData,
  });
}

export function useCommunitySearch(q: string) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.communitySearch(q, userId),
    queryFn: () => api.communities.list({ q, limit: 50 }, token),
    enabled: ready,
    placeholderData: keepPreviousData,
  });
}

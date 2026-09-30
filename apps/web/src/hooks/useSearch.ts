'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';

interface SearchOptions {
  limit?: number;
  enabled?: boolean;
}

export function useUserSearch(q: string, { limit = 50, enabled = true }: SearchOptions = {}) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.userSearch(q, limit, userId),
    queryFn: () => api.users.search({ q, limit }, token),
    enabled: ready && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCommunitySearch(q: string, { limit = 50, enabled = true }: SearchOptions = {}) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.communitySearch(q, limit, userId),
    queryFn: () => api.communities.list({ q, limit }, token),
    enabled: ready && enabled,
    placeholderData: keepPreviousData,
  });
}

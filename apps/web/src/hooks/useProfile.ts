'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';

export function useProfile(username: string) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.profile(username, userId),
    queryFn: () => api.users.get(username, token),
    enabled: ready,
  });
}

export function useUserThreads(username: string, type: 'posts' | 'comments') {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.userThreads(username, type, userId),
    queryFn: () => api.users.threads(username, { type, limit: 50 }, token),
    enabled: ready,
  });
}

export function useFollow(username: string) {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: (follow: boolean) =>
      follow ? api.users.follow(username, token!) : api.users.unfollow(username, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

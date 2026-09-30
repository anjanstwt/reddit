'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';

export function useCommunity(name: string) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.community(name, userId),
    queryFn: () => api.communities.get(name, token),
    enabled: ready,
  });
}

export function useMembership(name: string) {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: (join: boolean) => (join ? api.communities.join(name, token!) : api.communities.leave(name, token!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', name] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['search', 'communities'] });
      queryClient.invalidateQueries({ queryKey: keys.feeds });
    },
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: (body: { name: string; title: string; description?: string }) =>
      api.communities.create(body, token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

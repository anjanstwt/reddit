'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';

export function useMe() {
  const { token, userId } = useAccessToken();

  return useQuery({
    queryKey: keys.me(userId),
    queryFn: () => api.users.me(token!),
    enabled: !!token,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: (body: { username?: string; name?: string; bio?: string; avatarMediaId?: string }) =>
      api.users.updateMe(body, token!),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

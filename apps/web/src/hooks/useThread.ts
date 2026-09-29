'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';
import type { CommentSort, TiptapNode } from '@/lib/server/types';
import { textToDoc } from '@/lib/tiptap';

export function useThread(id: string) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.thread(id, userId),
    queryFn: () => api.threads.get(id, token),
    enabled: ready,
  });
}

export function useComments(postId: string, sort: CommentSort) {
  const { token, userId, ready } = useAccessToken();

  return useQuery({
    queryKey: keys.comments(postId, sort, userId),
    queryFn: () => api.threads.comments(postId, sort, token),
    enabled: ready,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: ({ community, title, body }: { community: string; title: string; body?: TiptapNode }) =>
      api.communities.createPost(community, { title, body }, token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.feeds }),
  });
}

export function useReply(postId: string) {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: ({ parentId, text }: { parentId: string; text: string }) =>
      api.threads.reply(parentId, textToDoc(text)!, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['thread', postId] });
      queryClient.invalidateQueries({ queryKey: keys.feeds });
    },
  });
}

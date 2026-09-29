'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { cancelThreadQueries, restoreThreads, snapshotThreads, updateThreadEverywhere } from '@/lib/server/cache';
import type { Thread, VoteValue } from '@/lib/server/types';

export function useVote() {
  const queryClient = useQueryClient();
  const { token } = useAccessToken();

  return useMutation({
    mutationFn: ({ thread, value }: { thread: Thread; value: VoteValue }) =>
      api.threads.vote(thread.id, value, token!),

    onMutate: async ({ thread, value }) => {
      await cancelThreadQueries(queryClient);
      const snapshot = snapshotThreads(queryClient);
      updateThreadEverywhere(queryClient, thread.id, (t) => applyVote(t, value));
      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context) restoreThreads(queryClient, context.snapshot);
    },

    onSuccess: (result, { thread }) => {
      updateThreadEverywhere(queryClient, thread.id, (t) => ({ ...t, ...result }));
    },
  });
}

function applyVote(thread: Thread, next: VoteValue): Thread {
  const prev = thread.viewerVote;
  const up = Number(next === 1) - Number(prev === 1);
  const down = Number(next === -1) - Number(prev === -1);
  return {
    ...thread,
    viewerVote: next,
    upvotes: thread.upvotes + up,
    downvotes: thread.downvotes + down,
    score: thread.score + up - down,
  };
}

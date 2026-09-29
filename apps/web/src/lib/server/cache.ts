import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query';

import type { Thread } from './types';

const threadRoots = [['feed'], ['thread'], ['comments']] as const;

export type ThreadSnapshot = [QueryKey, unknown][];

export async function cancelThreadQueries(queryClient: QueryClient) {
  await Promise.all(threadRoots.map((queryKey) => queryClient.cancelQueries({ queryKey })));
}

export function snapshotThreads(queryClient: QueryClient): ThreadSnapshot {
  return threadRoots.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }));
}

export function restoreThreads(queryClient: QueryClient, snapshot: ThreadSnapshot) {
  snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

export function updateThreadEverywhere(queryClient: QueryClient, id: string, update: (t: Thread) => Thread) {
  const map = (t: Thread): Thread => {
    const next = t.id === id ? update(t) : t;
    return next.replies ? { ...next, replies: next.replies.map(map) } : next;
  };

  queryClient.setQueriesData<InfiniteData<Thread[]>>(
    { queryKey: ['feed'] },
    (data) => data && { ...data, pages: data.pages.map((page) => page.map(map)) },
  );
  queryClient.setQueriesData<Thread>({ queryKey: ['thread'] }, (data) => data && map(data));
  queryClient.setQueriesData<Thread[]>({ queryKey: ['comments'] }, (data) => data?.map(map));
}

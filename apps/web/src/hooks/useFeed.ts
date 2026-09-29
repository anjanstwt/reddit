'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { useAccessToken } from '@/hooks/useAccessToken';
import { api } from '@/lib/server/api';
import { keys } from '@/lib/server/keys';
import type { PostSort } from '@/lib/server/types';

const PAGE_SIZE = 25;

export type FeedSource = 'home' | 'all' | { community: string };

export function useFeed(source: FeedSource, sort: PostSort) {
  const { token, userId, ready } = useAccessToken();
  const sourceKey = typeof source === 'string' ? source : `r/${source.community}`;

  return useInfiniteQuery({
    queryKey: keys.feed(sourceKey, sort, userId),
    enabled: ready,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params = { sort, limit: PAGE_SIZE, offset: pageParam };
      if (source === 'home') return token ? api.users.feed(params, token) : api.threads.all(params);
      if (source === 'all') return api.threads.all(params, token);
      return api.communities.posts(source.community, params, token);
    },
    getNextPageParam: (last, pages) => (last.length < PAGE_SIZE ? undefined : pages.length * PAGE_SIZE),
  });
}

import type { CommentSort, PostSort } from './types';

export const keys = {
  me: (userId?: string) => ['me', userId] as const,
  myCommunities: (userId?: string) => ['me', userId, 'communities'] as const,
  feeds: ['feed'] as const,
  feed: (source: string, sort: PostSort, userId?: string) => ['feed', source, sort, userId ?? 'anon'] as const,
  community: (name: string, userId?: string) => ['community', name, userId ?? 'anon'] as const,
  thread: (id: string, userId?: string) => ['thread', id, userId ?? 'anon'] as const,
  comments: (postId: string, sort: CommentSort, userId?: string) =>
    ['comments', postId, sort, userId ?? 'anon'] as const,
  profile: (username: string, userId?: string) => ['profile', username, userId ?? 'anon'] as const,
  userThreads: (username: string, type: 'posts' | 'comments', userId?: string) =>
    ['userThreads', username, type, userId ?? 'anon'] as const,
  userSearch: (q: string, limit: number, userId?: string) => ['search', 'users', q, limit, userId ?? 'anon'] as const,
  communitySearch: (q: string, limit: number, userId?: string) =>
    ['search', 'communities', q, limit, userId ?? 'anon'] as const,
};

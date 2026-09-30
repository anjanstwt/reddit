'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import PostCard from '@/components/utility/PostCard';
import PostSkeleton from '@/components/utility/PostSkeleton';
import SeparatedList from '@/components/utility/SeparatedList';
import { type FeedSource, useFeed } from '@/hooks/useFeed';
import type { PostSort } from '@/lib/server/types';

const sorts: { value: PostSort; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

interface FeedProps {
  source: FeedSource;
  defaultSort?: PostSort;
}

export default function Feed({ source, defaultSort = 'new' }: FeedProps) {
  const [sort, setSort] = useState<PostSort>(defaultSort);
  const feed = useFeed(source, sort);
  const posts = feed.data?.pages.flat() ?? [];

  return (
    <section>
      <div className="flex items-center gap-1 border-b border-white/10 pb-2">
        {sorts.map((s) => (
          <Button
            key={s.value}
            size="sm"
            variant={sort === s.value ? 'secondary' : 'ghost'}
            onClick={() => setSort(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {feed.isPending && (
        <SeparatedList>
          {Array.from({ length: 3 }, (_, i) => (
            <PostSkeleton key={i} />
          ))}
        </SeparatedList>
      )}

      {feed.isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-sm text-steel">
          Couldn&apos;t load posts.
          <Button variant="secondary" size="sm" onClick={() => feed.refetch()}>
            Try again
          </Button>
        </div>
      )}

      {feed.isSuccess && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-sm text-steel">
          {source === 'home' ? 'Join some communities to fill your home feed.' : 'No posts yet.'}
          <Button asChild variant="secondary" size="sm">
            <Link href="/popular">Browse popular posts</Link>
          </Button>
        </div>
      )}

      <SeparatedList>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </SeparatedList>

      {feed.hasNextPage && (
        <div className="flex justify-center py-6">
          <Button variant="secondary" onClick={() => feed.fetchNextPage()} disabled={feed.isFetchingNextPage}>
            {feed.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </section>
  );
}

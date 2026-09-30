'use client';

import { Lock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import Comment from '@/components/post/Comment';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/utility/Avatar';
import PostSkeleton from '@/components/utility/PostSkeleton';
import ReplyBox from '@/components/utility/ReplyBox';
import TiptapContent from '@/components/utility/TiptapContent';
import VoteButtons from '@/components/utility/VoteButtons';
import { useComments, useThread } from '@/hooks/useThread';
import { compactNumber, timeAgo } from '@/lib/format';
import { ApiError } from '@/lib/server/fetcher';
import type { CommentSort } from '@/lib/server/types';

const sorts: { value: CommentSort; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'old', label: 'Old' },
];

export default function PostDetail({ id }: { id: string }) {
  const { data: post, error, isPending } = useThread(id);
  const [sort, setSort] = useState<CommentSort>('top');
  const comments = useComments(id, sort);

  if (isPending) return <PostSkeleton />;
  if (error) {
    return (
      <p className="py-16 text-center text-sm text-steel">
        {error instanceof ApiError && error.status === 404 ? 'This post does not exist.' : "Couldn't load this post."}
      </p>
    );
  }

  const deleted = !!post.deletedAt;
  const author = post.author;

  return (
    <article className="flex flex-col gap-4">
      <header className="flex items-center gap-2 text-xs text-steel">
        {post.community && (
          <Link
            href={`/r/${post.community.name}`}
            className="flex items-center gap-2 font-semibold text-neutral-200 hover:underline"
          >
            <Avatar name={post.community.name} size={32} />
            r/{post.community.name}
          </Link>
        )}
        <span>•</span>
        <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        {author && (
          <span>
            •{' '}
            {author.username ? (
              <Link href={`/u/${author.username}`} className="hover:text-neutral-200 hover:underline">
                u/{author.username}
              </Link>
            ) : (
              author.name
            )}
          </span>
        )}
        {post.editedAt && !deleted && <span>(edited)</span>}
      </header>

      <h1 className="text-2xl leading-snug font-bold text-neutral-100">{deleted ? '[deleted]' : post.title}</h1>

      {deleted ? (
        <p className="text-sm text-steel italic">This post was deleted.</p>
      ) : (
        <TiptapContent doc={post.body} media={post.media} />
      )}

      <footer className="flex items-center gap-2">
        <VoteButtons thread={post} />
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-medium">
          <MessageCircle size={16} strokeWidth={1.75} />
          {compactNumber(post.commentCount)}
        </span>
      </footer>

      {post.locked ? (
        <p className="flex items-center gap-2 rounded-2xl bg-cement px-4 py-3 text-sm text-steel">
          <Lock size={16} />
          Comments are locked on this post.
        </p>
      ) : (
        !deleted && <ReplyBox postId={post.id} parentId={post.id} />
      )}

      <section className="border-t border-white/10 pt-3">
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs text-steel">Sort by</span>
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

        {comments.isPending && <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/5" />}
        {comments.isError && <p className="py-8 text-center text-sm text-steel">Couldn&apos;t load comments.</p>}
        {comments.data?.length === 0 && <p className="py-8 text-center text-sm text-steel">No comments yet.</p>}

        {comments.data?.map((comment) => (
          <Comment key={comment.id} comment={comment} postId={post.id} locked={post.locked} />
        ))}
      </section>
    </article>
  );
}

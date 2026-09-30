'use client';

import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import Avatar from '@/components/utility/Avatar';
import ReplyBox from '@/components/utility/ReplyBox';
import MediaGallery from '@/components/utility/MediaGallery';
import TiptapContent from '@/components/utility/TiptapContent';
import VoteButtons from '@/components/utility/VoteButtons';
import { timeAgo } from '@/lib/format';
import type { Thread } from '@/lib/server/types';

interface CommentProps {
  comment: Thread;
  postId: string;
  locked: boolean;
}

export default function Comment({ comment, postId, locked }: CommentProps) {
  const [replying, setReplying] = useState(false);
  const deleted = !!comment.deletedAt;
  const author = comment.author;

  return (
    <div className="flex gap-2 pt-3">
      <div className="flex flex-col items-center">
        <Avatar src={author?.avatarUrl} name={author?.name ?? '?'} size={28} />
        <div className="mt-2 w-px flex-1 bg-white/10" />
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-1.5 text-xs text-steel">
          {author?.username ? (
            <Link href={`/u/${author.username}`} className="font-semibold text-neutral-200 hover:underline">
              u/{author.username}
            </Link>
          ) : (
            <span className="font-semibold text-neutral-200">{author ? author.name : '[deleted]'}</span>
          )}
          <span>•</span>
          <time dateTime={comment.createdAt}>{timeAgo(comment.createdAt)}</time>
          {comment.editedAt && !deleted && <span>(edited)</span>}
        </header>

        {deleted ? (
          <p className="mt-1 text-sm text-steel italic">[deleted]</p>
        ) : (
          <>
            <TiptapContent doc={comment.body} className="mt-1 text-sm" />
            <MediaGallery doc={comment.body} media={comment.media} height={200} className="mt-2" />
          </>
        )}

        {!deleted && (
          <footer className="mt-1 flex items-center gap-1">
            <VoteButtons thread={comment} className="bg-transparent" />
            {!locked && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-steel"
                onClick={() => setReplying((r) => !r)}
              >
                <MessageCircle size={16} strokeWidth={1.75} />
                Reply
              </Button>
            )}
          </footer>
        )}

        {replying && (
          <div className="mt-2">
            <ReplyBox
              postId={postId}
              parentId={comment.id}
              placeholder={`Reply to u/${author?.username ?? author?.name ?? ''}`}
              autoFocus
              onDone={() => setReplying(false)}
            />
          </div>
        )}

        {comment.replies?.map((reply) => (
          <Comment key={reply.id} comment={reply} postId={postId} locked={locked} />
        ))}
      </div>
    </div>
  );
}

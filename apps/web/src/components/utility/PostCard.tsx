import { MessageCircle, Pin } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import Avatar from '@/components/utility/Avatar';
import MediaGallery from '@/components/utility/MediaGallery';
import VoteButtons from '@/components/utility/VoteButtons';
import { compactNumber, timeAgo } from '@/lib/format';
import type { Thread } from '@/lib/server/types';
import { plainText } from '@/lib/tiptap';

export default function PostCard({ post }: { post: Thread }) {
  const community = post.community;
  const href = `/r/${community?.name}/comments/${post.id}`;
  const preview = plainText(post.body);

  return (
    <article className="relative px-4 py-3 transition-colors hover:bg-white/[0.03]">
      <header className="flex items-center gap-1.5 text-xs text-steel">
        {community && (
          <Link
            href={`/r/${community.name}`}
            className="relative z-10 flex items-center gap-2 font-semibold text-neutral-200 hover:underline"
          >
            <Avatar name={community.name} size={24} />
            r/{community.name}
          </Link>
        )}
        <span>•</span>
        <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        {post.pinned && <Pin size={14} className="ml-1 text-green-500" aria-label="Pinned" />}
      </header>

      <h2 className="mt-1.5 text-lg leading-snug font-semibold text-neutral-100">
        <Link href={href} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h2>

      {preview && <p className="mt-1 line-clamp-3 text-sm text-neutral-400">{preview}</p>}

      <MediaGallery doc={post.body} media={post.media} height={256} className="relative z-10 mt-3" />

      <footer className="relative z-10 mt-3 flex items-center gap-2">
        <VoteButtons thread={post} />
        <Button asChild variant="secondary" size="sm" className="h-8 gap-1.5">
          <Link href={href}>
            <MessageCircle size={16} strokeWidth={1.75} />
            {compactNumber(post.commentCount)}
          </Link>
        </Button>
      </footer>
    </article>
  );
}

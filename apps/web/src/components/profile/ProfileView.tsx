'use client';

import { Cake } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import Avatar from '@/components/utility/Avatar';
import FollowButton from '@/components/utility/FollowButton';
import PostCard from '@/components/utility/PostCard';
import PostSkeleton from '@/components/utility/PostSkeleton';
import { useProfile, useUserThreads } from '@/hooks/useProfile';
import { compactNumber, timeAgo } from '@/lib/format';
import { ApiError } from '@/lib/server/fetcher';
import type { Thread } from '@/lib/server/types';
import { plainText } from '@/lib/tiptap';

type ProfileTab = 'posts' | 'comments';

const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });

export default function ProfileView({ username }: { username: string }) {
  const { data: profile, error, isPending } = useProfile(username);
  const [tab, setTab] = useState<ProfileTab>('posts');

  if (isPending) return <div className="h-40 animate-pulse rounded-2xl bg-white/5" />;
  if (error) {
    return (
      <p className="py-16 text-center text-sm text-steel">
        {error instanceof ApiError && error.status === 404
          ? `u/${username} doesn't exist.`
          : "Couldn't load this profile."}
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start gap-4">
        <Avatar src={profile.avatarUrl} name={profile.name} size={72} className="text-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm text-steel">u/{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm whitespace-pre-line text-neutral-300">{profile.bio}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel">
            <span>
              <strong className="font-semibold text-neutral-200">{compactNumber(profile.followerCount)}</strong>{' '}
              {profile.followerCount === 1 ? 'follower' : 'followers'}
            </span>
            <span>
              <strong className="font-semibold text-neutral-200">{compactNumber(profile.followingCount)}</strong>{' '}
              following
            </span>
            <span className="flex items-center gap-1">
              <Cake size={13} />
              Joined {dateFormat.format(new Date(profile.createdAt))}
            </span>
          </p>
        </div>
        <FollowButton profile={profile} />
      </header>

      <div className="flex items-center gap-1 border-b border-white/10 pb-2">
        {(['posts', 'comments'] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? 'secondary' : 'ghost'}
            onClick={() => setTab(t)}
            className="capitalize"
          >
            {t}
          </Button>
        ))}
      </div>

      <Threads username={username} type={tab} />
    </section>
  );
}

function Threads({ username, type }: { username: string; type: ProfileTab }) {
  const { data, isPending, isError } = useUserThreads(username, type);

  if (isPending) return <PostSkeleton />;
  if (isError) return <p className="py-12 text-center text-sm text-steel">Couldn&apos;t load {type}.</p>;
  if (data.length === 0) return <p className="py-12 text-center text-sm text-steel">No {type} yet.</p>;

  return (
    <div className="flex flex-col divide-y divide-white/10">
      {data.map((thread) =>
        type === 'posts' ? <PostCard key={thread.id} post={thread} /> : <CommentRow key={thread.id} comment={thread} />,
      )}
    </div>
  );
}

function CommentRow({ comment }: { comment: Thread }) {
  const href = `/r/${comment.community?.name}/comments/${comment.rootId}`;

  return (
    <article className="relative rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03]">
      <p className="text-xs text-steel">
        Commented in <span className="font-semibold text-neutral-200">r/{comment.community?.name}</span> ·{' '}
        {timeAgo(comment.createdAt)}
      </p>
      <Link href={href} className="mt-1 line-clamp-3 text-sm text-neutral-300 after:absolute after:inset-0">
        {plainText(comment.body) || 'View comment'}
      </Link>
    </article>
  );
}

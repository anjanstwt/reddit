'use client';

import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useVote } from '@/hooks/useVote';
import { compactNumber } from '@/lib/format';
import type { Thread } from '@/lib/server/types';
import { cn } from '@/lib/utils';

export default function VoteButtons({ thread, className }: { thread: Thread; className?: string }) {
  const { token } = useAccessToken();
  const vote = useVote();
  const current = thread.viewerVote;

  const cast = (value: 1 | -1) => {
    if (!token) return signIn('google');
    vote.mutate({ thread, value: current === value ? 0 : value });
  };

  return (
    <div
      className={cn(
        'flex h-8 items-center rounded-full bg-white/10 transition-colors',
        current === 1 && 'bg-orange-600',
        current === -1 && 'bg-indigo-600',
        className,
      )}
    >
      <Button variant="ghost" size="icon-sm" aria-label="Upvote" aria-pressed={current === 1} onClick={() => cast(1)}>
        <ArrowBigUp size={18} strokeWidth={1.5} fill={current === 1 ? 'currentColor' : 'none'} />
      </Button>
      <span className="min-w-5 text-center text-xs font-semibold tabular-nums">{compactNumber(thread.score)}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Downvote"
        aria-pressed={current === -1}
        onClick={() => cast(-1)}
      >
        <ArrowBigDown size={18} strokeWidth={1.5} fill={current === -1 ? 'currentColor' : 'none'} />
      </Button>
    </div>
  );
}

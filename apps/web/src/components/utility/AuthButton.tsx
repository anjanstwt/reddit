'use client';

import { LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import Avatar from '@/components/utility/Avatar';
import { useMe } from '@/hooks/useMe';
import { cn } from '@/lib/utils';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();

  if (status === 'loading') {
    return <div className="size-9 animate-pulse rounded-full bg-white/10" />;
  }

  if (!session || session.error) {
    return (
      <Button onClick={() => signIn('google')} className="font-semibold">
        Log In
      </Button>
    );
  }

  const name = me?.name ?? session.user.name;
  const username = me?.username ?? session.user.username;
  const image = me?.avatarUrl ?? session.user.image;

  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <Button variant="ghost" size="icon" aria-label="Account menu" onClick={() => setOpen((o) => !o)}>
        <Avatar src={image} name={name} size={32} />
      </Button>

      {open && (
        <div
          className={cn(
            'absolute top-12 right-0 w-56 overflow-hidden rounded-xl border border-white/10 bg-cement py-1',
            'shadow-lg shadow-black/40',
          )}
        >
          <div className="px-4 py-3">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-steel">{username ? `u/${username}` : 'No username yet'}</p>
          </div>
          {username && (
            <Button
              asChild
              variant="ghost"
              className="h-10 w-full justify-start gap-3 rounded-none px-4 font-normal hover:bg-white/5"
            >
              <Link href={`/u/${username}`} onClick={() => setOpen(false)}>
                <UserRound size={18} strokeWidth={1.75} />
                Profile
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="h-10 w-full justify-start gap-3 rounded-none px-4 font-normal hover:bg-white/5"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Log Out
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === 'loading') {
    return <div className="size-9 animate-pulse rounded-full bg-white/10" />;
  }

  if (!session || session.error) {
    return (
      <button
        type="button"
        onClick={() => signIn('google')}
        className="h-9 cursor-pointer rounded-full bg-neutral-200 px-4 text-sm font-semibold text-ink transition-colors hover:bg-white"
      >
        Log In
      </button>
    );
  }

  const { name, username, image } = session.user;

  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        type="button"
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-8 rounded-full object-cover" />
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

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
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

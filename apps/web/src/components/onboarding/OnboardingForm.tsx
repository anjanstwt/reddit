'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Avatar from '@/components/utility/Avatar';
import Divider from '@/components/utility/Divider';
import { useIsMac } from '@/hooks/useIsMac';
import { useUpdateMe } from '@/hooks/useMe';
import { errorMessage } from '@/lib/server/fetcher';
import type { Me } from '@/lib/server/types';
import { cn } from '@/lib/utils';

const usernamePattern = /^[a-z0-9_]{3,20}$/;

const GHOST = 'h-auto rounded-none bg-transparent p-0 hover:bg-transparent focus-visible:bg-transparent';

export default function OnboardingForm({ me }: { me: Me }) {
  const update = useUpdateMe();
  const isMac = useIsMac();
  const [username, setUsername] = useState('');
  const [name, setName] = useState(me.name);
  const [bio, setBio] = useState(me.bio);

  const validUsername = usernamePattern.test(username);
  const canSubmit = validUsername && !!name.trim() && !update.isPending;

  const submit = () => {
    if (!canSubmit) return;
    update.mutate({ username, name: name.trim(), bio: bio.trim() });
  };

  const invalid = update.isError || (username && !validUsername);
  const hint = update.isError
    ? errorMessage(update.error)
    : username && !validUsername
      ? 'Use 3-20 characters: a-z, 0-9 or _'
      : 'Your username is permanent. Name and bio can change later.';

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          submit();
        }
      }}
    >
      <section className="flex flex-col gap-4 px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <Avatar src={me.avatarUrl} name={me.name} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-100">Welcome to reddit</p>
            <p className="truncate text-xs text-steel">Pick a username to start posting and commenting.</p>
          </div>
        </div>

        <label className="flex items-baseline text-2xl leading-tight font-semibold">
          <span className="text-white/25">u/</span>
          <Input
            autoFocus
            value={username}
            placeholder="username"
            maxLength={20}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            className={cn(GHOST, 'text-2xl font-semibold text-neutral-100 placeholder:text-white/25')}
          />
        </label>

        <Input
          value={name}
          placeholder="Display name"
          maxLength={50}
          onChange={(e) => setName(e.target.value)}
          className={cn(GHOST, 'text-lg text-neutral-200 placeholder:text-white/25')}
        />
      </section>

      <section className="px-5 pt-1 pb-5">
        <Textarea
          value={bio}
          placeholder="A short bio (optional)"
          maxLength={200}
          rows={3}
          onChange={(e) => setBio(e.target.value)}
          className={cn(GHOST, 'min-h-20 resize-none text-[15px] placeholder:text-white/25')}
        />
      </section>

      <Divider />

      <footer className="flex items-center gap-3 px-5 py-4">
        <p className={cn('min-w-0 flex-1 truncate text-xs', invalid ? 'text-red-400' : 'text-steel')}>{hint}</p>
        <Button variant="ghost" onClick={() => signOut()} className="h-8 shrink-0 text-steel">
          Log out
        </Button>
        <Button onClick={submit} disabled={!canSubmit} className="h-8 shrink-0 gap-1.5">
          {update.isPending ? 'Saving…' : 'Continue'}
          <kbd className="text-xs opacity-60">{isMac ? '⌘' : 'Ctrl'}↵</kbd>
        </Button>
      </footer>
    </div>
  );
}

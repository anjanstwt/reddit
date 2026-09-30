'use client';

import { ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Avatar from '@/components/utility/Avatar';
import Divider from '@/components/utility/Divider';
import IconButton from '@/components/utility/IconButton';
import { useCreateCommunity } from '@/hooks/useCommunity';
import { useIsMac } from '@/hooks/useIsMac';
import { errorMessage } from '@/lib/server/fetcher';
import { cn } from '@/lib/utils';

const namePattern = /^[a-z0-9_]{3,21}$/;

const GHOST = 'h-auto rounded-none bg-transparent p-0 hover:bg-transparent focus-visible:bg-transparent';

export default function CreateCommunityForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const create = useCreateCommunity();
  const isMac = useIsMac();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const validName = namePattern.test(name);
  const canSubmit = validName && !!title.trim() && !create.isPending;

  const submit = () => {
    if (!canSubmit) return;
    create.mutate(
      { name, title: title.trim(), description: description.trim() },
      {
        onSuccess: (community) => {
          onDone();
          router.push(`/r/${community.name}`);
        },
      },
    );
  };

  const hint = create.isError
    ? errorMessage(create.error)
    : name && !validName
      ? 'Use 3-21 characters: a-z, 0-9 or _'
      : 'The name is permanent. The title and description can change later.';

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
      <section className="flex flex-col gap-4 px-5 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <span className="flex h-8 items-center gap-2 rounded-full border border-white/[0.06] pr-3 pl-1.5">
              <Avatar name={name || 'r'} size={20} />
              <span className={cn(!name && 'text-steel')}>r/{name || 'community'}</span>
            </span>
            <ChevronRight size={16} className="text-steel" />
            <span>New community</span>
          </div>
          <IconButton icon={X} label="Close" onClick={onDone} className="-mr-2 size-8" />
        </div>

        <label className="flex items-baseline text-2xl leading-tight font-semibold">
          <span className="text-white/25">r/</span>
          <Input
            autoFocus
            value={name}
            placeholder="name"
            maxLength={21}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            className={cn(GHOST, 'text-2xl font-semibold text-neutral-100 placeholder:text-white/25')}
          />
        </label>

        <Input
          value={title}
          placeholder="Title"
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(GHOST, 'text-lg text-neutral-200 placeholder:text-white/25')}
        />
      </section>

      <section className="px-5 pt-1 pb-5">
        <Textarea
          value={description}
          placeholder="What is this community about? (optional)"
          maxLength={500}
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(GHOST, 'min-h-24 resize-none text-[15px] placeholder:text-white/25')}
        />
      </section>

      <Divider />

      <footer className="flex items-center gap-3 px-5 py-4">
        <p
          className={cn(
            'min-w-0 flex-1 truncate text-xs',
            create.isError || (name && !validName) ? 'text-red-400' : 'text-steel',
          )}
        >
          {hint}
        </p>
        <Button onClick={submit} disabled={!canSubmit} className="h-8 shrink-0 gap-1.5">
          {create.isPending ? 'Creating…' : 'Create'}
          <kbd className="text-xs opacity-60">{isMac ? '⌘' : 'Ctrl'}↵</kbd>
        </Button>
      </footer>
    </div>
  );
}

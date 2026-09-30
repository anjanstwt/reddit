'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { FLOATING_SHADOW } from '@/components/editor/styles';
import { Input } from '@/components/ui/input';
import Avatar from '@/components/utility/Avatar';
import Block from '@/components/utility/Block';
import Divider from '@/components/utility/Divider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCommunitySearch, useUserSearch } from '@/hooks/useSearch';
import { compactNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type SearchTab = 'communities' | 'users';

const RESULT_LIMIT = 6;

const tabs: { value: SearchTab; label: string }[] = [
  { value: 'communities', label: 'Org' },
  { value: 'users', label: 'User' },
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SearchTab>('communities');
  const root = useRef<HTMLDivElement>(null);
  const q = useDebouncedValue(query.trim());
  const showPanel = open && !!q;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const explore = `/explore?q=${encodeURIComponent(q)}${tab === 'users' ? '&tab=people' : ''}`;
  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative mx-auto w-full max-w-[560px]">
      <Block className="h-10 flex-row items-center gap-3 px-4 transition-colors focus-within:bg-[#1c1c1c] hover:bg-[#1a1a1a]">
        <Search size={17} className="pointer-events-none shrink-0 text-steel" />
        <form
          role="search"
          className="h-full min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            close();
            router.push(query.trim() ? explore : '/explore');
          }}
        >
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === 'Escape' && close()}
            placeholder="Search communities and users"
            className="h-full rounded-none bg-transparent px-0 hover:bg-transparent focus-visible:bg-transparent"
          />
        </form>
        <div
          role="tablist"
          aria-label="Search for"
          className="-mr-2 flex shrink-0 items-center rounded-full bg-white/5 p-0.5"
        >
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setTab(t.value)}
              className={cn(
                'h-6 cursor-pointer rounded-full px-2.5 text-[11px] font-medium transition-colors',
                tab === t.value ? 'bg-white/15 text-neutral-100' : 'text-steel hover:text-neutral-200',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Block>

      {showPanel && (
        <Block className={cn('absolute top-full right-0 left-0 z-50 mt-2', FLOATING_SHADOW)}>
          <div className="max-h-80 w-full overflow-y-auto p-1 [scrollbar-width:none]">
            {tab === 'communities' ? <CommunityResults q={q} onPick={close} /> : <UserResults q={q} onPick={close} />}
          </div>

          <Divider />
          <Link
            href={explore}
            onClick={close}
            className="w-full truncate px-4 py-2.5 text-xs text-steel transition-colors hover:bg-white/[0.03] hover:text-neutral-200"
          >
            See all results for “{q}”
          </Link>
        </Block>
      )}
    </div>
  );
}

const ROW = 'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5';

function CommunityResults({ q, onPick }: { q: string; onPick: () => void }) {
  const { data, isPending, isError } = useCommunitySearch(q, { limit: RESULT_LIMIT });
  if (isPending) return <RowsSkeleton />;
  if (isError) return <Empty text="Couldn't search communities." />;
  if (data.length === 0) return <Empty text={`No communities match “${q}”.`} />;

  return data.map((community) => (
    <Link key={community.id} href={`/r/${community.name}`} onClick={onPick} className={ROW}>
      <Avatar src={community.iconUrl} name={community.name} size={28} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-100">r/{community.name}</p>
        <p className="truncate text-xs text-steel">
          {compactNumber(community.memberCount)} {community.memberCount === 1 ? 'member' : 'members'}
        </p>
      </div>
    </Link>
  ));
}

function UserResults({ q, onPick }: { q: string; onPick: () => void }) {
  const { data, isPending, isError } = useUserSearch(q, { limit: RESULT_LIMIT });
  if (isPending) return <RowsSkeleton />;
  if (isError) return <Empty text="Couldn't search users." />;
  if (data.length === 0) return <Empty text={`No users match “${q}”.`} />;

  return data.map((profile) => (
    <Link key={profile.id} href={`/u/${profile.username}`} onClick={onPick} className={ROW}>
      <Avatar src={profile.avatarUrl} name={profile.name} size={28} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-neutral-100">{profile.name}</p>
        <p className="truncate text-xs text-steel">u/{profile.username}</p>
      </div>
    </Link>
  ));
}

function RowsSkeleton() {
  return Array.from({ length: 3 }, (_, i) => <div key={i} className="m-1 h-10 animate-pulse rounded-lg bg-white/5" />);
}

function Empty({ text }: { text: string }) {
  return <p className="px-3 py-6 text-center text-xs text-steel">{text}</p>;
}

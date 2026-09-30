'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Block from '@/components/utility/Block';
import CommunityRow from '@/components/utility/CommunityRow';
import UserRow from '@/components/utility/UserRow';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCommunitySearch, useUserSearch } from '@/hooks/useSearch';

export type ExploreTab = 'communities' | 'people';

const tabs: { value: ExploreTab; label: string }[] = [
  { value: 'communities', label: 'Communities' },
  { value: 'people', label: 'People' },
];

export default function ExploreView({ initialQuery, initialTab }: { initialQuery: string; initialTab: ExploreTab }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<ExploreTab>(initialTab);
  const q = useDebouncedValue(query.trim());

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tab !== 'communities') params.set('tab', tab);
    const search = params.toString();
    router.replace(search ? `/explore?${search}` : '/explore', { scroll: false });
  }, [q, tab, router]);

  return (
    <section className="flex flex-col gap-4">
      <Block className="h-10 flex-row items-center gap-3 px-4 transition-colors focus-within:bg-[#1c1c1c] hover:bg-[#1a1a1a]">
        <Search size={17} className="shrink-0 text-steel" />
        <Input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'communities' ? 'Search communities' : 'Search people'}
          className="h-full rounded-none bg-transparent px-0 hover:bg-transparent focus-visible:bg-transparent"
        />
      </Block>

      <div className="flex items-center gap-1 border-b border-white/10 pb-2">
        {tabs.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={tab === t.value ? 'secondary' : 'ghost'}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'communities' ? <CommunityResults q={q} /> : <PeopleResults q={q} />}
    </section>
  );
}

function CommunityResults({ q }: { q: string }) {
  const { data, isPending, isError } = useCommunitySearch(q);
  if (isPending) return <ResultsSkeleton />;
  if (isError) return <Empty text="Couldn't load communities." />;
  if (data.length === 0) return <Empty text={q ? `No communities match “${q}”.` : 'No communities yet.'} />;

  return (
    <div className="flex flex-col">
      {data.map((community) => (
        <CommunityRow key={community.id} community={community} />
      ))}
    </div>
  );
}

function PeopleResults({ q }: { q: string }) {
  const { data, isPending, isError } = useUserSearch(q);
  if (isPending) return <ResultsSkeleton />;
  if (isError) return <Empty text="Couldn't load people." />;
  if (data.length === 0) return <Empty text={q ? `No one matches “${q}”.` : 'No people yet.'} />;

  return (
    <div className="flex flex-col">
      {data.map((profile) => (
        <UserRow key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-16 text-center text-sm text-steel">{text}</p>;
}

'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import Block from '@/components/utility/Block';

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <Block className="mx-auto h-10 w-full max-w-[560px] flex-row items-center gap-3 px-4 transition-colors focus-within:bg-[#1c1c1c] hover:bg-[#1a1a1a]">
      <Search size={17} className="pointer-events-none shrink-0 text-steel" />
      <form
        role="search"
        className="h-full min-w-0 flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore');
        }}
      >
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search communities and people"
          className="h-full rounded-none bg-transparent px-0 hover:bg-transparent focus-visible:bg-transparent"
        />
      </form>
    </Block>
  );
}

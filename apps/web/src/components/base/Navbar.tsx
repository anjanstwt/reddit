import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

import AuthButton from '@/components/utility/AuthButton';
import { cn } from '@/lib/utils';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/10 bg-ink px-4">
      <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight lg:w-60">
        reddit
      </Link>

      <label
        className={cn(
          'mx-auto flex h-10 w-full max-w-[560px] items-center gap-3 rounded-full bg-white/10 px-4',
          'transition-colors focus-within:bg-white/15 hover:bg-white/15',
        )}
      >
        <Search size={18} className="shrink-0 text-steel" />
        <input
          type="search"
          placeholder="Search Reddit"
          className="w-full bg-transparent text-sm outline-none placeholder:text-steel"
        />
      </label>

      <nav className="flex shrink-0 items-center gap-1 lg:w-60 lg:justify-end">
        <Link
          href="/submit"
          className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors hover:bg-white/10"
        >
          <Plus size={20} strokeWidth={1.75} />
          <span className="hidden sm:inline">Create</span>
        </Link>
        <AuthButton />
      </nav>
    </header>
  );
}

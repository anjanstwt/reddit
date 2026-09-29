import { Search } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import AuthButton from '@/components/utility/AuthButton';
import CreatePostButton from '@/components/utility/CreatePostButton';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/10 bg-ink px-4">
      <Link href="/" className="shrink-0 text-2xl font-extrabold tracking-tight lg:w-60">
        reddit
      </Link>

      <div className="relative mx-auto w-full max-w-[560px]">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-steel" />
        <Input type="search" placeholder="Search Reddit" className="h-10 pl-11" />
      </div>

      <nav className="flex shrink-0 items-center gap-1 lg:w-60 lg:justify-end">
        <CreatePostButton variant="ghost" className="h-10 px-3" />
        <AuthButton />
      </nav>
    </header>
  );
}

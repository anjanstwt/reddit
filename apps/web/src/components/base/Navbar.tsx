import { Search } from 'lucide-react';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import AuthButton from '@/components/utility/AuthButton';
import Block from '@/components/utility/Block';
import CreatePostButton from '@/components/utility/CreatePostButton';
import RightSidebarToggle from '@/components/utility/RightSidebarToggle';
import SidebarToggle from '@/components/utility/SidebarToggle';

export default function Navbar() {
  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-4 px-4">
      <div className="flex shrink-0 items-center gap-2 lg:w-60">
        <SidebarToggle className="hidden lg:inline-flex" />
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          reddit
        </Link>
      </div>

      <Block className="mx-auto h-10 w-full max-w-[560px] flex-row items-center gap-3 px-4 transition-colors focus-within:bg-[#1c1c1c] hover:bg-[#1a1a1a]">
        <Search size={17} className="pointer-events-none shrink-0 text-steel" />
        <Input
          type="search"
          placeholder="Search Reddit"
          className="h-full rounded-none bg-transparent px-0 hover:bg-transparent focus-visible:bg-transparent"
        />
      </Block>

      <nav className="flex shrink-0 items-center gap-1 lg:w-60 lg:justify-end">
        <CreatePostButton variant="ghost" className="h-10 px-3" />
        <RightSidebarToggle className="hidden xl:inline-flex" />
        <AuthButton />
      </nav>
    </header>
  );
}

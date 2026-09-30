import Link from 'next/link';

import AuthButton from '@/components/utility/AuthButton';
import CreatePostButton from '@/components/utility/CreatePostButton';
import RightSidebarToggle from '@/components/utility/RightSidebarToggle';
import SearchBar from '@/components/utility/SearchBar';
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

      <SearchBar />

      <nav className="flex shrink-0 items-center gap-1 lg:w-60 lg:justify-end">
        <CreatePostButton variant="ghost" className="h-10 px-3" />
        <RightSidebarToggle className="hidden xl:inline-flex" />
        <AuthButton />
      </nav>
    </header>
  );
}

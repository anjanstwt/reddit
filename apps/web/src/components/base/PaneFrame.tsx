'use client';

import { ChevronRight, Compass, House, type LucideIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import Avatar from '@/components/utility/Avatar';
import Block from '@/components/utility/Block';
import Divider from '@/components/utility/Divider';

export const PANE_TOP_BAR_HEIGHT = 42;

const ROOT_PAGES: Record<string, { label: string; icon: LucideIcon }> = {
  '/': { label: 'Home', icon: House },
  '/popular': { label: 'Popular', icon: TrendingUp },
  '/explore': { label: 'Explore', icon: Compass },
};

export default function PaneFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scroller = useRef<HTMLElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <Block className="min-w-0 flex-1">
      <div className="flex w-full shrink-0 items-center gap-2 px-2.5" style={{ height: PANE_TOP_BAR_HEIGHT }}>
        <Breadcrumb pathname={pathname} />
      </div>
      <Divider />
      <main ref={scroller} className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {children}
      </main>
    </Block>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const root = ROOT_PAGES[pathname];
  if (root) {
    const Icon = root.icon;
    return (
      <span className="flex items-center gap-2 text-[13px] font-medium tracking-wide text-white/80">
        <Icon size={15} strokeWidth={1.75} className="text-steel" />
        {root.label}
      </span>
    );
  }

  const [, section, name, sub] = pathname.split('/');
  if (section === 'u' && name) {
    return (
      <span className="flex items-center gap-2 text-[13px] font-medium tracking-wide text-white/80">
        <Avatar name={name} size={18} />
        u/{name}
      </span>
    );
  }
  if (section !== 'r' || !name) return null;

  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium tracking-wide">
      <Link href={`/r/${name}`} className="flex min-w-0 items-center gap-2 text-white/80 hover:text-neutral-100">
        <Avatar name={name} size={18} />
        <span className="truncate">r/{name}</span>
      </Link>
      {sub === 'comments' && (
        <>
          <ChevronRight size={14} className="shrink-0 text-steel" />
          <span className="text-steel">Post</span>
        </>
      )}
    </nav>
  );
}

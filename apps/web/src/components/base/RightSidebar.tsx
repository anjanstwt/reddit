'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useState } from 'react';

import { PANE_TOP_BAR_HEIGHT } from '@/components/base/PaneFrame';
import Block from '@/components/utility/Block';
import Divider from '@/components/utility/Divider';
import { cn } from '@/lib/utils';
import { useRightSidebarStore } from '@/store/useRightSidebarStore';

const PANEL_WIDTH = 352;
const PANEL_GUTTER = 6;

const footerLinks = [
  { href: '/rules', label: 'Rules' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'User Agreement' },
];

export default function RightSidebar() {
  const isOpen = useRightSidebarStore((s) => s.isOpen);
  const title = useRightSidebarStore((s) => s.title);
  const close = useRightSidebarStore((s) => s.close);
  const setSlot = useRightSidebarStore((s) => s.setSlot);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    useRightSidebarStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ']' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      useRightSidebarStore.getState().toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <aside
      aria-label={title ?? 'Recent posts'}
      inert={!isOpen}
      style={{ width: isOpen ? PANEL_WIDTH : 0 }}
      className={cn(
        'hidden h-full min-h-0 shrink-0 overflow-hidden xl:block',
        hydrated ? 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : 'transition-none',
      )}
    >
      <Block style={{ width: PANEL_WIDTH - PANEL_GUTTER, marginLeft: PANEL_GUTTER }} className="h-full">
        <header style={{ height: PANE_TOP_BAR_HEIGHT }} className="flex w-full shrink-0 items-center gap-2 pr-1.5 pl-3">
          <h2 className="truncate text-[14px] font-medium text-neutral-100">{title ?? 'Recent posts'}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close sidebar  ]"
            title="Close  ]"
            className="ml-auto flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
          >
            <X size={16} aria-hidden />
          </button>
        </header>
        <Divider />

        <div className="min-h-0 w-full flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
          {!title && <p className="text-[13px] text-steel">Posts you visit will show up here.</p>}
          <div ref={setSlot} />
        </div>

        <Divider />
        <footer className="flex w-full shrink-0 flex-wrap gap-x-3 gap-y-1 px-3 py-3 text-[11px] text-steel">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-neutral-200">
              {link.label}
            </Link>
          ))}
          <span className="w-full">reddit clone © {new Date().getFullYear()}</span>
        </footer>
      </Block>
    </aside>
  );
}

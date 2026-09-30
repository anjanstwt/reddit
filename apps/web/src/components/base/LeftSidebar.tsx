'use client';

import { CircleHelp, Compass, House, Info, Plus, ScrollText, Settings, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { signIn } from 'next-auth/react';
import { useEffect, useLayoutEffect, useState } from 'react';

import SidebarResizeHandle from '@/components/base/SidebarResizeHandle';
import { BLOCK } from '@/components/utility/Block';
import SidebarItem from '@/components/utility/SidebarItem';
import SidebarSection from '@/components/utility/SidebarSection';
import { useAccessToken } from '@/hooks/useAccessToken';
import { useMyCommunities } from '@/hooks/useMyCommunities';
import { cn } from '@/lib/utils';
import { useCreateCommunityStore } from '@/store/useCreateCommunityStore';
import {
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_PANEL_WIDTH_CSS_VAR,
  SIDEBAR_WIDTH_CSS_VAR,
  useSidebarStore,
} from '@/store/useSidebarStore';

const feeds = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/popular', icon: TrendingUp, label: 'Popular' },
  { href: '/explore', icon: Compass, label: 'Explore' },
];

const resources = [
  { href: '/about', icon: Info, label: 'About' },
  { href: '/help', icon: CircleHelp, label: 'Help' },
  { href: '/rules', icon: ScrollText, label: 'Rules' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LeftSidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const dragging = useSidebarStore((s) => s.dragging);
  const [hydrated, setHydrated] = useState(false);
  const { data: joined } = useMyCommunities();
  const { token } = useAccessToken();
  const openCreateCommunity = useCreateCommunityStore((s) => s.openDialog);

  useLayoutEffect(() => {
    useSidebarStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '[' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      useSidebarStore.getState().toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const instant = dragging || !hydrated;

  return (
    <div className="hidden h-full shrink-0 lg:flex">
      <aside
        aria-label="Sidebar"
        style={{ width: `var(${SIDEBAR_WIDTH_CSS_VAR}, ${SIDEBAR_DEFAULT_WIDTH}px)` }}
        className={cn(
          'h-full min-h-0 shrink-0 overflow-hidden perspective-distant',
          instant ? 'transition-none' : 'transition-[width] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]',
        )}
      >
        <motion.div
          initial={false}
          animate={collapsed ? { rotateY: -32, scale: 0.9 } : { rotateY: 0, scale: 1 }}
          transition={{ duration: instant ? 0 : 0.35, ease: EASE }}
          style={{
            width: `var(${SIDEBAR_PANEL_WIDTH_CSS_VAR}, ${SIDEBAR_DEFAULT_WIDTH}px)`,
            transformOrigin: 'left center',
          }}
          className={cn(
            BLOCK,
            'h-full min-h-0',
            collapsed && 'pointer-events-none',
          )}
        >
          <nav className="flex h-full flex-col gap-3 overflow-x-hidden overflow-y-auto px-2 py-3 [scrollbar-width:none]">
            <div className="flex flex-col gap-0.5">
              {feeds.map((item) => (
                <SidebarItem key={item.href} {...item} />
              ))}
              <SidebarItem
                icon={Plus}
                label="Start a community"
                onClick={() => (token ? openCreateCommunity() : signIn('google'))}
              />
            </div>

            <SidebarSection title="Communities">
              <SidebarItem key="manage" href="/communities" icon={Settings} label="Manage communities" />
              {joined?.map((community) => (
                <SidebarItem
                  key={community.id}
                  href={`/r/${community.name}`}
                  label={`r/${community.name}`}
                  avatar={{ src: community.iconUrl, name: community.name }}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Resources">
              {resources.map((item) => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </SidebarSection>
          </nav>
        </motion.div>
      </aside>
      <SidebarResizeHandle />
    </div>
  );
}

'use client';

import { CircleHelp, Compass, House, Info, Menu, Plus, ScrollText, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import IconButton from '@/components/utility/IconButton';
import { useMyCommunities } from '@/hooks/useMyCommunities';
import SidebarItem from '@/components/utility/SidebarItem';
import SidebarSection from '@/components/utility/SidebarSection';
import { cn } from '@/lib/utils';

const feeds = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/popular', icon: TrendingUp, label: 'Popular' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/communities/create', icon: Plus, label: 'Start a community' },
];

const communities = [{ href: '/communities', icon: Settings, label: 'Manage Communities' }];

const resources = [
  { href: '/about', icon: Info, label: 'About' },
  { href: '/help', icon: CircleHelp, label: 'Help' },
  { href: '/rules', icon: ScrollText, label: 'Rules' },
];

export default function LeftSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: joined } = useMyCommunities();

  return (
    <aside
      className={cn(
        'sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 border-r border-white/10 transition-[width] duration-200 lg:block',
        collapsed ? 'w-6' : 'w-[272px]',
      )}
    >
      <IconButton
        icon={Menu}
        label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        onClick={() => setCollapsed((c) => !c)}
        className="absolute top-4 -right-5 z-10 border border-white/20 bg-ink hover:bg-ink"
      />

      <nav
        className={cn(
          'flex h-full w-[272px] flex-col overflow-y-auto px-4 py-4 [scrollbar-width:thin]',
          collapsed && 'invisible',
        )}
      >
        <div className="flex flex-col gap-0.5 pb-3">
          {feeds.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </div>

        <SidebarSection title="Communities">
          {communities.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
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
    </aside>
  );
}

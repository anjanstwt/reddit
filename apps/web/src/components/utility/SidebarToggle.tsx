'use client';

import { PanelLeft } from 'lucide-react';

import IconButton from '@/components/utility/IconButton';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/useSidebarStore';

export default function SidebarToggle({ className }: { className?: string }) {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <IconButton
      icon={PanelLeft}
      label={collapsed ? 'Expand sidebar  [' : 'Collapse sidebar  ['}
      onClick={toggle}
      className={cn('size-8 text-steel hover:text-neutral-100', className)}
    />
  );
}

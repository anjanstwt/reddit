'use client';

import { PanelRight } from 'lucide-react';

import IconButton from '@/components/utility/IconButton';
import { cn } from '@/lib/utils';
import { useRightSidebarStore } from '@/store/useRightSidebarStore';

export default function RightSidebarToggle({ className }: { className?: string }) {
  const isOpen = useRightSidebarStore((s) => s.isOpen);
  const toggle = useRightSidebarStore((s) => s.toggle);

  return (
    <IconButton
      icon={PanelRight}
      label={isOpen ? 'Close right sidebar  ]' : 'Open right sidebar  ]'}
      aria-pressed={isOpen}
      onClick={toggle}
      className={cn('size-8 text-steel hover:text-neutral-100', isOpen && 'text-neutral-100', className)}
    />
  );
}

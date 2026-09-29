'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export default function SidebarItem({ href, icon: Icon, label }: SidebarItemProps) {
  const active = usePathname() === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex h-11 items-center gap-3 rounded-lg px-4 text-[15px] text-neutral-200 transition-colors',
        active ? 'bg-white/10' : 'hover:bg-white/5',
      )}
    >
      <Icon size={20} strokeWidth={1.75} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

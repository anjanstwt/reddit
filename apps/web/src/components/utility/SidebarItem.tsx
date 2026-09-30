'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Avatar from '@/components/utility/Avatar';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href?: string;
  onClick?: () => void;
  label: string;
  icon?: LucideIcon;
  avatar?: { src?: string | null; name: string };
}

export default function SidebarItem({ href, onClick, label, icon: Icon, avatar }: SidebarItemProps) {
  const pathname = usePathname();
  const active = !!href && pathname === href;
  const className = cn(
    'group flex w-full cursor-pointer items-center gap-1 rounded-[5px] py-1 pr-2.5 pl-2 text-left font-medium tracking-wider',
    'transition-colors outline-none focus-visible:ring-1 focus-visible:ring-white/30',
    active ? 'bg-[#222222] text-white/90' : 'text-white/65 hover:bg-[#1c1c1c] hover:text-neutral-100',
  );

  const content = (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center">
        {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />}
        {avatar && <Avatar src={avatar.src} name={avatar.name} size={16} />}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px]">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

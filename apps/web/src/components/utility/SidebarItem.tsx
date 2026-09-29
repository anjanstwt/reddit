'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import Avatar from '@/components/utility/Avatar';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  avatar?: { src?: string | null; name: string };
}

export default function SidebarItem({ href, label, icon: Icon, avatar }: SidebarItemProps) {
  const active = usePathname() === href;

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        'h-11 w-full justify-start gap-3 rounded-lg px-4 text-[15px] font-normal',
        active ? 'bg-white/10' : 'hover:bg-white/5',
      )}
    >
      <Link href={href}>
        {Icon && <Icon size={20} strokeWidth={1.75} />}
        {avatar && <Avatar src={avatar.src} name={avatar.name} size={28} />}
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  );
}

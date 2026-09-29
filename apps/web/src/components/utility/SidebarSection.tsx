'use client';

import { ChevronDown } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SidebarSection({ title, defaultOpen = true, children }: SidebarSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group border-t border-white/10 py-3">
      <CollapsibleTrigger
        className={cn(
          'flex h-10 w-full cursor-pointer items-center justify-between rounded-lg px-4',
          'text-xs font-medium tracking-[0.15em] text-steel uppercase transition-colors hover:bg-white/5',
        )}
      >
        {title}
        <ChevronDown size={18} className="transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 flex flex-col gap-0.5">{children}</CollapsibleContent>
    </Collapsible>
  );
}

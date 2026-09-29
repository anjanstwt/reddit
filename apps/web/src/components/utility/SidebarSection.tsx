'use client';

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SidebarSection({ title, defaultOpen = true, children }: SidebarSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group border-t border-white/10 py-3">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 w-full justify-between rounded-lg px-4 text-xs tracking-[0.15em] text-steel uppercase hover:bg-white/5"
        >
          {title}
          <ChevronDown size={18} className="transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 flex flex-col gap-0.5">{children}</CollapsibleContent>
    </Collapsible>
  );
}

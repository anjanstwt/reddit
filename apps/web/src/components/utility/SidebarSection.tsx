'use client';

import { ChevronDown } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import { Children, isValidElement, useState } from 'react';

import { cn } from '@/lib/utils';

const HEIGHT_SPRING = { type: 'spring', stiffness: 800, damping: 48, mass: 0.6 } as const;

const CONTAINER_VARIANTS: Variants = {
  open: { height: 'auto', transition: { ...HEIGHT_SPRING, staggerChildren: 0.018 } },
  closed: { height: 0, transition: { ...HEIGHT_SPRING, staggerChildren: 0.01, staggerDirection: -1 } },
};

const ROW_VARIANTS: Variants = {
  open: { opacity: 1, y: 0, transition: { duration: 0.13, ease: [0.4, 0, 0.2, 1] } },
  closed: { opacity: 0, y: -4, transition: { duration: 0.08, ease: [0.4, 0, 0.2, 1] } },
};

interface SidebarSectionProps {
  title: string;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SidebarSection({ title, action, defaultOpen = true, children }: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <section className="flex flex-col">
      <div className={cn('flex items-center justify-between gap-1', action && 'pr-1')}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 cursor-pointer items-center gap-x-2 rounded-md px-2 py-1.5 text-left text-[12px] font-medium text-neutral-500 capitalize outline-none focus-visible:ring-1 focus-visible:ring-white/30"
        >
          <span className="truncate">{title}</span>
          <ChevronDown size={12} className={cn('shrink-0 transition-transform', !open && '-rotate-90')} aria-hidden />
        </button>
        {action && <span className="flex items-center">{action}</span>}
      </div>

      <motion.div
        initial={false}
        animate={open ? 'open' : 'closed'}
        variants={CONTAINER_VARIANTS}
        className="flex flex-col gap-0.5 overflow-hidden"
        aria-hidden={!open}
      >
        {rows.map((child) => (
          <motion.div key={child.key} variants={ROW_VARIANTS}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

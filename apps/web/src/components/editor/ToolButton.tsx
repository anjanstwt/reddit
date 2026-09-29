'use client';

import type { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface ToolButtonProps extends React.ComponentProps<'button'> {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  danger?: boolean;
}

const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(function ToolButton(
  { icon: Icon, label, active, danger, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      {...props}
      className={cn(
        'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors',
        active ? 'bg-white/15 text-neutral-100' : 'text-steel hover:bg-white/10 hover:text-neutral-200',
        danger && 'hover:bg-red-500/10 hover:text-red-400',
        className,
      )}
    >
      <Icon size={17} strokeWidth={1.75} />
    </button>
  );
});

export default ToolButton;

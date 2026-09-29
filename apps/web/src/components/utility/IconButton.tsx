import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ComponentProps<'button'> {
  icon: LucideIcon;
  label: string;
}

export default function IconButton({ icon: Icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full',
        'text-neutral-200 transition-colors hover:bg-white/10',
        className,
      )}
      {...props}
    >
      <Icon size={20} strokeWidth={1.75} />
    </button>
  );
}

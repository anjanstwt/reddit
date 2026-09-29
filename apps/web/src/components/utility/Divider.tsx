import { cn } from '@/lib/utils';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function Divider({ orientation = 'horizontal', className }: DividerProps) {
  const vertical = orientation === 'vertical';

  return (
    <div aria-hidden className={cn('flex shrink-0', vertical ? 'mx-1 h-5 flex-row' : 'w-full flex-col', className)}>
      <div className={cn('bg-blade', vertical ? 'w-px' : 'h-px')} />
      <div className={cn('bg-[#1f1f1f]', vertical ? 'w-px' : 'h-px')} />
    </div>
  );
}

import { cn } from '@/lib/utils';

export default function Block({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'group relative box-border flex flex-col overflow-hidden rounded-xl',
        'border-t-[0.5px] border-t-[#292929] bg-[#171717]',
        'shadow-[0_0_0_1px_rgba(41,41,41,0),0_1px_2px_0_rgba(0,0,0,0.1)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

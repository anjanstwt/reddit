import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-full bg-white/10 px-4 text-sm text-neutral-200 outline-none transition-colors',
        'placeholder:text-steel hover:bg-white/15 focus-visible:bg-white/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'min-h-24 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm text-neutral-200 outline-none transition-colors',
        'placeholder:text-steel hover:bg-white/15 focus-visible:bg-white/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

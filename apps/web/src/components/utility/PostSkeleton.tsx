import { cn } from '@/lib/utils';

export default function PostSkeleton({ className }: { className?: string }) {
  return (
    <article className={cn('flex animate-pulse flex-col gap-3 border-b border-white/10 px-4 py-4', className)}>
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-full bg-white/10" />
        <div className="h-3 w-32 rounded bg-white/10" />
      </div>
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="aspect-video w-full rounded-2xl bg-white/5" />
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-full bg-white/10" />
        <div className="h-8 w-16 rounded-full bg-white/10" />
        <div className="h-8 w-20 rounded-full bg-white/10" />
      </div>
    </article>
  );
}

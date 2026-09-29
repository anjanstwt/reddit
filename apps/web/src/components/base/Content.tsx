import { cn } from '@/lib/utils';

interface ContentProps {
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function Content({ aside, className, children }: ContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] gap-6 px-4 py-4 lg:px-8">
      <div className={cn('min-w-0 flex-1', className)}>{children}</div>

      {aside && (
        <aside className="hidden w-[316px] shrink-0 xl:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto [scrollbar-width:none]">
            {aside}
          </div>
        </aside>
      )}
    </div>
  );
}

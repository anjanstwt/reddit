import { cn } from '@/lib/utils';

export default function Content({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[800px] px-4 py-4 lg:px-6', className)}>{children}</div>;
}

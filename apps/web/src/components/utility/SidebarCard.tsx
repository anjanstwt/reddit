import { cn } from '@/lib/utils';

interface SidebarCardProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function SidebarCard({ title, action, className, children }: SidebarCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-2xl bg-cement', className)}>
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-xs font-medium tracking-[0.15em] text-steel uppercase">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

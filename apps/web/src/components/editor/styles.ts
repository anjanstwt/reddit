import { cn } from '@/lib/utils';

export const FLOATING_SHADOW = 'shadow-[0_8px_24px_rgba(0,0,0,0.45)]';

export const MENU_ITEM = cn(
  'flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] text-neutral-200',
  'outline-none select-none data-[selected=true]:bg-white/10 [&_svg]:shrink-0 [&_svg]:text-steel',
);

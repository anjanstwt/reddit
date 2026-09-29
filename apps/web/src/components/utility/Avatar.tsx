import Image from 'next/image';

import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, name, size = 32, className }: AvatarProps) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        style={style}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: size * 0.45 }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-neutral-200 uppercase',
        className,
      )}
    >
      {name.charAt(0)}
    </span>
  );
}

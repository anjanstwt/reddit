import Image from 'next/image';

import type { MediaInfo, TiptapNode } from '@/lib/server/types';
import { mediaIds } from '@/lib/tiptap';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  doc: TiptapNode | null;
  media?: Record<string, MediaInfo>;
  height?: number;
  className?: string;
}

const TILE = 'relative shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-blade';

export default function MediaGallery({ doc, media, height = 288, className }: MediaGalleryProps) {
  const items = mediaIds(doc)
    .map((id) => media?.[id])
    .filter((item): item is MediaInfo => !!item);

  if (items.length === 0) return null;

  if (items.length === 1) {
    const [item] = items;
    return (
      <div className={cn(TILE, 'aspect-video w-full', className)}>
        <MediaItem item={item} fill />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.url} className={TILE} style={{ height, width: Math.round(height * aspectRatio(item)) }}>
          <MediaItem item={item} fill />
        </div>
      ))}
    </div>
  );
}

function aspectRatio(item: MediaInfo) {
  const ratio = item.width && item.height ? item.width / item.height : 16 / 9;
  return Math.min(Math.max(ratio, 0.6), 1.8);
}

function MediaItem({ item, fill }: { item: MediaInfo; fill?: boolean }) {
  if (item.kind === 'video') {
    return (
      <video src={item.url} controls preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
    );
  }
  return (
    <Image src={item.url} alt="" fill={fill} sizes="(max-width: 1024px) 100vw, 740px" className="object-contain" />
  );
}

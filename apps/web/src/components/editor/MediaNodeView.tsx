'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { X } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

export default function MediaNodeView({ node, deleteNode, selected }: ReactNodeViewProps) {
  const src = node.attrs.src as string | null;
  const video = node.type.name === 'video';

  return (
    <NodeViewWrapper
      className={cn(
        'group relative my-3 overflow-hidden rounded-2xl border border-white/10 bg-blade',
        selected && 'ring-2 ring-sky-500',
      )}
    >
      {src &&
        (video ? (
          <video src={src} controls preload="metadata" className="max-h-[420px] w-full" />
        ) : (
          <Image
            src={src}
            alt=""
            width={0}
            height={0}
            sizes="720px"
            className="h-auto max-h-[420px] w-full object-contain"
          />
        ))}
      <button
        type="button"
        aria-label={`Remove ${video ? 'video' : 'image'}`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => deleteNode()}
        className={cn(
          'absolute top-2 right-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/60',
          'text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80',
        )}
      >
        <X size={16} />
      </button>
    </NodeViewWrapper>
  );
}

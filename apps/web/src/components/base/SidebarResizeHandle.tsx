'use client';

import { useRef } from 'react';

import { cn } from '@/lib/utils';
import { SIDEBAR_COLLAPSE_THRESHOLD, useSidebarStore } from '@/store/useSidebarStore';

export default function SidebarResizeHandle() {
  const setWidth = useSidebarStore((s) => s.setWidth);
  const collapse = useSidebarStore((s) => s.collapse);
  const setDragging = useSidebarStore((s) => s.setDragging);
  const collapsed = useSidebarStore((s) => s.collapsed);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const { width, collapsed } = useSidebarStore.getState();
    drag.current = { startX: e.clientX, startWidth: collapsed ? 0 : width };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const next = drag.current.startWidth + (e.clientX - drag.current.startX);
    if (next < SIDEBAR_COLLAPSE_THRESHOLD) {
      drag.current = null;
      setDragging(false);
      collapse();
      return;
    }
    setWidth(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        'group relative flex shrink-0 cursor-col-resize touch-none items-center justify-center',
        collapsed ? 'w-0' : 'w-1.5',
      )}
    >
      <span className="absolute inset-y-0 -right-1 -left-1" aria-hidden />
      {!collapsed && (
        <span className="pointer-events-none h-[90%] w-1 rounded-full bg-transparent transition-colors group-hover:bg-white/20" />
      )}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { useRightSidebarStore } from '@/store/useRightSidebarStore';

export default function RightSidebarContent({ title, children }: { title: string; children: React.ReactNode }) {
  const slot = useRightSidebarStore((s) => s.slot);
  const setTitle = useRightSidebarStore((s) => s.setTitle);

  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);

  return slot ? createPortal(children, slot) : null;
}

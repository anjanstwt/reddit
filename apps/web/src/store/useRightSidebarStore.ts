import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RightSidebarState {
  isOpen: boolean;
  title: string | null;
  slot: HTMLElement | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setTitle: (title: string | null) => void;
  setSlot: (slot: HTMLElement | null) => void;
}

export const useRightSidebarStore = create<RightSidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      title: null,
      slot: null,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setTitle: (title) => set({ title }),
      setSlot: (slot) => set({ slot }),
    }),
    {
      name: 'right-sidebar',
      skipHydration: true,
      partialize: (state) => ({ isOpen: state.isOpen }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SIDEBAR_MIN_WIDTH = 208;
export const SIDEBAR_MAX_WIDTH = 320;
export const SIDEBAR_DEFAULT_WIDTH = 240;
export const SIDEBAR_COLLAPSE_THRESHOLD = 30;
export const SIDEBAR_WIDTH_CSS_VAR = '--sidebar-width';
export const SIDEBAR_PANEL_WIDTH_CSS_VAR = '--sidebar-panel-width';

const clampWidth = (width: number) => Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));

const applyWidthVars = (width: number, collapsed: boolean) => {
  const root = document.documentElement.style;
  root.setProperty(SIDEBAR_WIDTH_CSS_VAR, `${collapsed ? 0 : width}px`);
  root.setProperty(SIDEBAR_PANEL_WIDTH_CSS_VAR, `${width}px`);
};

interface SidebarState {
  width: number;
  collapsed: boolean;
  dragging: boolean;
  setWidth: (width: number) => void;
  collapse: () => void;
  expand: () => void;
  toggle: () => void;
  setDragging: (dragging: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      width: SIDEBAR_DEFAULT_WIDTH,
      collapsed: false,
      dragging: false,
      setWidth: (width) => {
        const clamped = clampWidth(width);
        applyWidthVars(clamped, false);
        set({ width: clamped, collapsed: false });
      },
      collapse: () => {
        applyWidthVars(get().width, true);
        set({ collapsed: true });
      },
      expand: () => {
        applyWidthVars(get().width, false);
        set({ collapsed: false });
      },
      toggle: () => (get().collapsed ? get().expand() : get().collapse()),
      setDragging: (dragging) => set({ dragging }),
    }),
    {
      name: 'sidebar',
      skipHydration: true,
      partialize: (state) => ({ width: state.width, collapsed: state.collapsed }),
      onRehydrateStorage: () => (state) => {
        if (state) applyWidthVars(state.width, state.collapsed);
      },
    },
  ),
);

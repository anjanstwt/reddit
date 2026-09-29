import { create } from 'zustand';

interface CreatePostStore {
  open: boolean;
  community: string | null;
  openDialog: (community?: string) => void;
  close: () => void;
}

export const useCreatePostStore = create<CreatePostStore>((set) => ({
  open: false,
  community: null,
  openDialog: (community) => set({ open: true, community: community ?? null }),
  close: () => set({ open: false }),
}));

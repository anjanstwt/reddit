import { create } from 'zustand';

interface CreateCommunityStore {
  open: boolean;
  openDialog: () => void;
  close: () => void;
}

export const useCreateCommunityStore = create<CreateCommunityStore>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  close: () => set({ open: false }),
}));

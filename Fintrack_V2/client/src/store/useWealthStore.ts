import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WealthState {
  isMasked: boolean;
  togglePrivacyMode: () => void;
  setMasked: (mask: boolean) => void;
}

export const useWealthStore = create<WealthState>()(
  persist(
    (set) => ({
      isMasked: false,
      togglePrivacyMode: () => set((state) => ({ isMasked: !state.isMasked })),
      setMasked: (mask) => set({ isMasked: mask }),
    }),
    {
      name: 'wealth-privacy-storage',
    }
  )
);

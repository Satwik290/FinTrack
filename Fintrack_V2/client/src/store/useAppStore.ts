'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AppState {
  isDarkMode: boolean;
  user: User | null;
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;
  setUser: (u: User | null) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      user: null,
      sidebarCollapsed: false,

      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setDarkMode: (v) => set({ isDarkMode: v }),
      setUser: (u) => set({ user: u }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'fintrack-app' }
  )
);

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface LayoutState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    set => ({
      collapsed: false,
      setCollapsed: collapsed => set({ collapsed }),
    }),
    {
      name: 'layout',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ collapsed: state.collapsed }),
    },
  ),
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MenuState {
  openKeys: string[]
  selectedKeys: string[]
  setOpenKeys: (keys: string[]) => void
  setSelectedKeys: (keys: string[]) => void
}

export const useMenuStore = create<MenuState>()(
  persist(
    set => ({
      openKeys: [],
      selectedKeys: [],
      setOpenKeys: keys => set({ openKeys: keys }),
      setSelectedKeys: keys => set({ selectedKeys: keys }),
    }),
    {
      name: 'menu',
      partialize: state => ({
        openKeys: state.openKeys,
        selectedKeys: state.selectedKeys,
      }),
    },
  ),
)

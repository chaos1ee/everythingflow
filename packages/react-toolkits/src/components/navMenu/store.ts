import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface NavState {
  openKeys: string[]
  selectedKeys: string[]
  setOpenKeys: (keys: string[]) => void
  setSelectedKeys: (keys: string[]) => void
}

export const useNavStore = create<NavState>()(
  persist(
    set => ({
      openKeys: [],
      setOpenKeys: keys => set({ openKeys: keys }),
      selectedKeys: [],
      setSelectedKeys: keys => set({ selectedKeys: keys }),
    }),
    {
      name: 'nav',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        openKeys: state.openKeys,
        selectedKeys: state.selectedKeys,
      }),
    },
  ),
)

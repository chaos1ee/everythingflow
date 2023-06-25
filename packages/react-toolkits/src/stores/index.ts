import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TokenState {
  token: string
  setToken: (token: string) => void
  clearToken: () => void
}

export const useTokenStore = create<TokenState>()(
  persist(
    set => ({
      token: '',
      setToken: token => set({ token }),
      clearToken: () => {
        set({ token: '' })
        useTokenStore.persist.clearStorage()
      },
    }),
    {
      name: 'token',
      partialize: state => ({ token: state.token }),
    },
  ),
)

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

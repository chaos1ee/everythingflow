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

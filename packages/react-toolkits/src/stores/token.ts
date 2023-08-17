import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import jwtDecode from 'jwt-decode'

interface UserInfo {
  authorityId: string
  exp: number
}

export interface TokenState {
  token: string
  getUser: () => UserInfo | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      token: '',
      getUser: () => {
        try {
          return jwtDecode(get().token) as UserInfo
        } catch (_) {
          return null
        }
      },
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

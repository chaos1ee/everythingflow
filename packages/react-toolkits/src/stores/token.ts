import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import jwtDecode from 'jwt-decode'
import { request } from '@/utils'

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
      onRehydrateStorage() {
        return (_, error) => {
          if (!error) {
            setTimeout(() => {
              // 检查 token 是否合法。token 不合法时，使用 request 的错误处理逻辑。
              request('/api/usystem/user/check', { method: 'post', body: { permissions: ['100001'] } })
            }, 400)
          }
        }
      },
    },
  ),
)

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
        useTokenStore.persist.clearStorage()
      },
    }),
    {
      name: 'token',
      partialize: state => ({ token: state.token }),
      onRehydrateStorage() {
        return (state, error) => {
          if (error) {
            toLoginPage()
          } else {
            const url = new URL('/api/usystem/user/check', window.location.href)

            fetch(url, {
              method: 'post',
              body: JSON.stringify({ permissions: ['100001'] }),
              headers: { Authorization: `Bearer ${state?.token}` },
            })
              .then(response => {
                if (!response.ok) {
                  if (response.status === 401) {
                    toLoginPage()
                  } else if (response.status === 412) {
                    toLoginPage(true)
                  }
                }
              })
              .catch(() => {
                toLoginPage()
              })
          }
        }
      },
    },
  ),
)

function toLoginPage(notUser?: boolean) {
  window.location.replace(`${window.location.origin}/login${notUser ? '?not_user=1' : ''}`)
}

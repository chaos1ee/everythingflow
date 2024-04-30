import { jwtDecode } from 'jwt-decode'
import useSWR from 'swr'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useToolkitsContext } from '../components/ContextProvider'
import { useRequest } from '../hooks/request'

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
    (set, get, store) => ({
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
        get().setToken('')
        store.persist.clearStorage()
      },
    }),
    {
      name: 'token',
      partialize: state => ({ token: state.token }),
      skipHydration: true,
    },
  ),
)

export function useTokenValidation(skip = false) {
  const { usePermissionApiV2 } = useToolkitsContext()
  const request = useRequest()

  useSWR(
    !skip ? (usePermissionApiV2 ? '/api/usystem/user/checkV2' : '/api/usystem/user/check') : null,
    (url: string) =>
      request(url, {
        method: 'POST',
        body: {
          permissions: ['100001'],
        },
        isGlobal: true,
      }),
    {
      suspense: true,
      revalidateIfStale: false,
    },
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import jwtDecode from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import type { RequestError } from '@/utils/request'
import { request } from '@/utils/request'
import { useToolkitsContext } from '@/components/ContextProvider'

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
    },
  ),
)

export function useValidateToken() {
  const navigate = useNavigate()
  const { clearToken } = useTokenStore()
  const [validated, setValidated] = useState(false)
  const { usePermissionApiV2 } = useToolkitsContext()

  // 发送请求验证 token 是否有效，无效则跳转到登录页。
  useSWRImmutable(
    !validated && location.pathname !== '/login'
      ? usePermissionApiV2
        ? '/api/usystem/user/checkV2'
        : '/api/usystem/user/check'
      : null,
    (url: string) =>
      request(url, {
        method: 'post',
        body: { permissions: ['100001'] },
      }),
    {
      suspense: true,
      shouldRetryOnError: false,
      onError(err: RequestError) {
        if (err.status === 401) {
          clearToken()
          navigate('/login')
        } else if (err.status === 412) {
          clearToken()
          navigate('/login', { state: { notUser: true } })
        }
      },
    },
  )

  useEffect(() => {
    setValidated(true)
  }, [])
}

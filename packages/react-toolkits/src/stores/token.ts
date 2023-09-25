import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import jwtDecode from 'jwt-decode'
import type { RequestError } from '@/utils'
import { request } from '@/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useSWRImmutable from 'swr/immutable'

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
  const location = useLocation()
  const { clearToken } = useTokenStore()
  const [validated, setValidated] = useState(false)

  useSWRImmutable(
    !validated && location.pathname !== '/login' ? '/token/validate' : null,
    () =>
      request('/api/usystem/user/check', {
        method: 'post',
        body: { permissions: ['100001'] },
      }),
    {
      suspense: true,
      shouldRetryOnError: false,
      onError(err: RequestError) {
        if (err.code === 401) {
          clearToken()
          navigate('/login')
        } else if (err.code === 412) {
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

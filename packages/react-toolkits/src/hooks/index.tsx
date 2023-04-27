import { useQuery } from '@tanstack/react-query'
import { TOKEN_FLAG } from '../constants'
import type { PermissionCheckResult } from '../types'
import { useSearchParams } from 'react-router-dom'
import { createHttpClient } from '../libs/client'
import { useGames } from '../layouts'

const client = createHttpClient()
const globalClient = createHttpClient({ headers: { 'app-id': 'global' } })

export function useToken() {
  const [searchParams] = useSearchParams()
  const path = '/usystem/user/login'

  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: [path, searchParams.get('ticket')],
    queryFn: async () => {
      const { token } = await globalClient.get<{ token: string }>(path, {
        params: { ticket: searchParams.get('ticket') },
      })
      return token
    },
    onSuccess: value => {
      localStorage.setItem(TOKEN_FLAG, value)
    },
    enabled: searchParams.has('ticket'),
  })

  return { token: data ?? localStorage.getItem(TOKEN_FLAG) ?? '', isLoading: isLoading && fetchStatus !== 'idle' }
}

export function usePermission(code: string, global = false) {
  const { game } = useGames()
  const path = '/usystem/user/checkV2'

  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: [path, game, code],
    queryFn: () => {
      return (global ? globalClient : client)
        .post<{ has_all: true } | PermissionCheckResult>(path, {
          permissions: [code],
        })
        .then((res: { has_all: boolean } | PermissionCheckResult) => {
          if (res.has_all) {
            return true
          } else {
            return (res as PermissionCheckResult)[code]
          }
        })
    },
    enabled: !!code,
  })

  return {
    accessible: data ?? false,
    isChecking: isLoading && fetchStatus !== 'idle',
  }
}

export function usePermissions<T extends string>(codes: Record<T, string>, global = false) {
  const { data, ...restValues } = useQuery({
    queryKey: ['/usystem/user/checkV2', codes],
    queryFn: () => {
      return (global ? globalClient : client)
        .post<{ has_all: true } | PermissionCheckResult>('/usystem/user/checkV2', {
          permissions: Object.values(codes),
        })
        .then((res: { has_all: boolean } | PermissionCheckResult) => {
          if (res.has_all) {
            return Object.keys(codes).reduce((acc, curr) => {
              acc[curr as T] = true
              return acc
            }, {} as Record<T, boolean>)
          }

          return Object.entries(codes).reduce((acc, curr) => {
            acc[curr[0] as T] = (res as PermissionCheckResult)[curr[1] as string] ?? false
            return acc
          }, {} as Record<T, boolean>)
        })
    },
  })

  return {
    ...restValues,
    permissions: data,
  }
}

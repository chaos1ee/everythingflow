import { createHttpClient } from '../httpClient'
import { useQuery } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'

type PermissionCheckResult = Record<string, boolean> | { has_all: true }

export function useHttpClient(options?: AxiosRequestConfig) {
  return createHttpClient(options)
}

export function useGlobalHttpClient(options?: AxiosRequestConfig) {
  return createHttpClient({
    ...options,
    headers: {
      ...options?.headers,
      'app-id': 'global',
    },
  })
}

export function usePermissions(codes: Record<string, string>, isGlobalNS = false) {
  const client = useHttpClient()
  const globalClient = useGlobalHttpClient()

  const { data, isLoading, fetchStatus } = useQuery({
    queryKey: ['/usystem/user/checkV2', codes],
    queryFn: () => {
      return (isGlobalNS ? globalClient : client)
        .post<PermissionCheckResult>('/usystem/user/checkV2', {
          permissions: Object.values(codes),
        })
        .then(res => {
          if (res.has_all) {
            return Object.keys(codes).reduce((acc, curr) => {
              acc[curr] = true
              return acc
            }, {} as Record<string, boolean>)
          }

          return Object.entries(codes).reduce((acc, curr) => {
            acc[curr[0]] = (res as Record<string, boolean>)[curr[1] as string]
            return acc
          }, {} as Record<string, boolean>)
        })
    },
    enabled: Object.keys(codes).length > 0,
  })

  return {
    permissions: data,
    isValidating: isLoading && fetchStatus !== 'idle',
  }
}

export function usePermission(code?: string, isGlobalNS = false) {
  const { permissions, isValidating } = usePermissions(code ? { [code]: code } : {}, isGlobalNS)

  if (!code) {
    return {
      accessible: true,
      isValidating: false,
    }
  }

  return {
    accessible: permissions?.[code] ?? false,
    isValidating,
  }
}

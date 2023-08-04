import useSWRImmutable from 'swr/immutable'
import { useNavigate } from 'react-router-dom'
import { useHttpClient } from './use-http-client'

export interface PermissionCheckResult {
  [k: string]: boolean
}

export function usePermissions(codes: string[]) {
  const httpClient = useHttpClient()
  const navigate = useNavigate()

  const { data, isLoading } = useSWRImmutable(
    codes.length > 0
      ? {
          method: 'POST',
          url: '/api/usystem/user/check',
          data: { permissions: codes },
        }
      : null,
    config =>
      httpClient.request<PermissionCheckResult>(config).then(res => {
        if (res.has_all) {
          return codes.reduce(
            (acc, curr) => {
              acc[curr] = true
              return acc
            },
            {} as Record<string, boolean>,
          )
        }

        return codes.reduce(
          (acc, curr) => {
            acc[curr] = (res as Record<string, boolean>)[curr]
            return acc
          },
          {} as Record<string, boolean>,
        )
      }),
    {
      suspense: true,
      shouldRetryOnError: false,
      onError() {
        navigate('/login')
      },
    },
  )

  return { data, isLoading }
}

export function usePermission(code: string) {
  const { data, isLoading } = usePermissions(code ? [code] : [])

  if (!code) {
    return {
      accessible: true,
      isValidating: false,
    }
  }

  return {
    accessible: data?.[code] ?? false,
    isValidating: isLoading,
  }
}

import useSWRImmutable from 'swr/immutable'
import { useFetcher } from './use-fetcher'

export interface PermissionCheckResult {
  [k: string]: boolean
}

export function usePermissions(codes: string[]) {
  const fetcher = useFetcher()

  const { data, isLoading } = useSWRImmutable(
    codes.length > 0
      ? {
          method: 'POST',
          url: '/api/usystem/user/check',
          data: { permissions: codes },
        }
      : null,
    config =>
      fetcher<PermissionCheckResult>(config).then(res => {
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
      shouldRetryOnError: false,
    },
  )

  return { data, isLoading }
}

export function usePermission(code?: string) {
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

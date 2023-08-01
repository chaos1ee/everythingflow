import useSWRImmutable from 'swr/immutable'
import { useFetcher } from './use-fetcher'

export interface PermissionCheckResult {
  [k: string]: boolean
}

export function usePermissions(codes: Record<string, string>) {
  const fetcher = useFetcher()

  const { data, isLoading } = useSWRImmutable(
    Object.keys(codes).length > 0
      ? {
          method: 'POST',
          url: '/api/usystem/user/check',
          data: { permissions: Object.values(codes) },
        }
      : null,
    config =>
      fetcher<PermissionCheckResult>(config).then(res => {
        if (res.has_all) {
          return Object.keys(codes).reduce(
            (acc, curr) => {
              acc[curr] = true
              return acc
            },
            {} as Record<string, boolean>,
          )
        }

        return Object.entries(codes).reduce(
          (acc, curr) => {
            acc[curr[0]] = (res as Record<string, boolean>)[curr[1] as string]
            return acc
          },
          {} as Record<string, boolean>,
        )
      }),
  )

  return { data, isLoading }
}

export function usePermission(code?: string) {
  const { data, isLoading } = usePermissions(code ? { [code]: code } : {})

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

import useSWRImmutable from 'swr/immutable'
import { request } from '@/utils'
import { useToolkitContext } from '@/components'

export interface PermissionCheckResult {
  [k: string]: boolean
}

export function usePermissions(codes: string[], isGlobalNS?: boolean) {
  const { usePermissionV2 } = useToolkitContext()

  const { data, isLoading } = useSWRImmutable(
    codes.length > 0 ? [usePermissionV2 ? '/api/usystem/user/checkV2' : '/api/usystem/user/check', codes] : null,
    ([url, permissions]: [string, string[]]) =>
      request<PermissionCheckResult>(
        url,
        {
          method: 'post',
          body: { permissions },
        },
        isGlobalNS,
      ).then(res => {
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
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  )

  return { data, isLoading }
}

export function usePermission(code: string | undefined, isGlobalNS?: boolean) {
  const { data, isLoading } = usePermissions(code ? [code] : [], isGlobalNS)

  if (code === undefined) {
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

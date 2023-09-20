import useSWRImmutable from 'swr/immutable'
import { request } from '@/utils'
import { useToolkitContext } from '@/components'

export type PermissionCheckResult =
  | { has_all: true }
  | {
      [k: string]: boolean
    }

export function usePermissions(
  codes: string[],
  opts?: {
    isGlobalNS?: boolean
    suspense?: boolean
  },
) {
  const { usePermissionV2 } = useToolkitContext()

  const { data, isLoading } = useSWRImmutable(
    codes.length > 0 ? { url: usePermissionV2 ? '/api/usystem/user/checkV2' : '/api/usystem/user/check', codes } : null,
    ({ url }) =>
      request<PermissionCheckResult>(
        url,
        {
          method: 'post',
          body: {
            permissions: codes,
          },
        },
        opts?.isGlobalNS,
      ).then(response => {
        if (response.data.has_all) {
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
            acc[curr] = (response.data as Record<string, boolean>)[curr]
            return acc
          },
          {} as Record<string, boolean>,
        )
      }),
    {
      suspense: opts?.suspense,
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  )

  return { data, isValidating: isLoading }
}

export function usePermission(
  code: string | undefined,
  opts?: {
    isGlobalNS?: boolean
    suspense?: boolean
  },
) {
  const { data, isValidating } = usePermissions(code ? [code] : [], opts)

  if (code === undefined) {
    return {
      accessible: true,
      isValidating: false,
    }
  }

  return {
    accessible: data?.[code] ?? false,
    isValidating,
  }
}

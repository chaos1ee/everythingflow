import { useToolkitsContext } from '@/components/ContextProvider'
import { request } from '@/utils/request'
import useSWR from 'swr'

type PermissionCheckResult =
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
  const { usePermissionApiV2 } = useToolkitsContext()

  const { data, isValidating, isLoading } = useSWR(
    codes.length > 0 ? [usePermissionApiV2 ? '/api/usystem/user/checkV2' : '/api/usystem/user/check', codes] : null,
    ([url]) =>
      request<PermissionCheckResult>(url, {
        method: 'post',
        body: {
          permissions: codes,
        },
        isGlobalNS: opts?.isGlobalNS,
      }).then(response => {
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
      shouldRetryOnError: false,
    },
  )

  return { data, isValidating, isLoading }
}

export function usePermission(
  code: string | undefined,
  opts?: {
    isGlobalNS?: boolean
    suspense?: boolean
  },
) {
  const { data, isValidating, isLoading } = usePermissions(code ? [code] : [], opts)

  if (code === undefined) {
    return {
      accessible: true,
      isValidating: false,
      isLoading: false,
    }
  }

  return {
    accessible: data?.[code] ?? false,
    isValidating,
    isLoading,
  }
}

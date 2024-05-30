import type { SWRConfiguration } from 'swr'
import useSWR from 'swr'
import { useToolkitsContext } from '../components/ContextProvider'
import { request } from '../utils/request'

type PermissionCheckResult = { has_all: true } | { [k: string]: boolean }

export function usePermissions(codes: string[], isGlobal?: boolean, config?: SWRConfiguration) {
  const { usePermissionApiV2 } = useToolkitsContext()
  const { data, isValidating, isLoading } = useSWR(
    codes.length > 0 ? [usePermissionApiV2 ? '/api/usystem/user/checkV2' : '/api/usystem/user/check', codes] : null,
    ([url]) =>
      request<PermissionCheckResult>(url, {
        method: 'POST',
        body: {
          permissions: codes,
        },
        isGlobal,
      }).then(response => {
        if (response.data?.has_all) {
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
            acc[curr] = (response.data as Record<string, boolean>)?.[curr] ?? false
            return acc
          },
          {} as Record<string, boolean>,
        )
      }),
    {
      revalidateOnFocus: false,
      ...config,
    },
  )

  return { data, isValidating, isLoading }
}

export function usePermission(code: string | undefined, isGlobal?: boolean, config?: SWRConfiguration) {
  const { data, isValidating, isLoading } = usePermissions(code ? [code] : [], isGlobal, config)

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

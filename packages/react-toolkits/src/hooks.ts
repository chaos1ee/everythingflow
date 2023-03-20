import { useQuery } from '@tanstack/react-query'
import queryKeys from './libs/queries'

export function useToken(ticket?: string | null) {
  const { data, ...restValues } = useQuery({
    ...queryKeys.permission.token(ticket),
    retry: false,
  })
  return { ...restValues, token: data }
}

export function usePermission(code?: string) {
  const query = useQuery({
    ...queryKeys.permission.check(code),
    retryDelay: 100000,
  })

  return {
    ...query,
    data: query.data ?? false,
  }
}

export function usePermissions<T extends string>(codes: Record<T, string>) {
  const { data, ...restValues } = useQuery({
    ...queryKeys.permission.batchCheck(codes),
    retryDelay: 20000,
  })

  return {
    ...restValues,
    permissions: data,
  }
}

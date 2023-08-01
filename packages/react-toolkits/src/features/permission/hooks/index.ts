import { useFetcher, usePermission } from '@/hooks'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { PermissionEnumItem, RoleEnumItem } from '../types'

export function useAllPermissions() {
  return useSWR<PermissionEnumItem[]>({
    url: '/api/usystem/user/allPermssions',
  })
}

export function useAllRoles() {
  const { accessible } = usePermission('200005')

  return useSWR<RoleEnumItem[]>(
    accessible
      ? {
          url: '/api/usystem/role/all',
        }
      : null,
  )
}

export function useRole(name: string) {
  return useSWR({
    url: '/api/usystem/role/info',
    params: { name },
  })
}

export function useCreateRole() {
  const fetcher = useFetcher()

  return useSWRMutation(
    '/api/usystem/role/create',
    (
      url,
      {
        arg,
      }: {
        arg: { name: string; permissions: string[] }
      },
    ) => fetcher({ method: 'POST', url, data: arg }),
  )
}

export function useUpdateRole() {
  const fetcher = useFetcher()

  return useSWRMutation(
    '/api/usystem/role/update',
    (
      url,
      {
        arg,
      }: {
        arg: { id: number; name: string; permissions: string[] }
      },
    ) => fetcher({ method: 'POST', url, data: arg }),
  )
}

export function useRemoveRole() {
  const fetcher = useFetcher()

  return useSWRMutation(
    '/api/usystem/role/delete',
    (
      url,
      {
        arg,
      }: {
        arg: { id: number; name: string }
      },
    ) => fetcher({ method: 'POST', url, data: arg }),
  )
}

export function useCreateUser() {
  const fetcher = useFetcher()

  return useSWRMutation(
    '/api/usystem/user/create',
    (
      url,
      {
        arg,
      }: {
        arg: { name: string; roles: string[] }
      },
    ) =>
      fetcher({
        method: 'POST',
        url,
        data: arg,
      }),
  )
}

export function useUpdateUser() {
  const fetcher = useFetcher()

  return useSWRMutation(
    '/api/usystem/user/update',
    (
      url,
      {
        arg,
      }: {
        arg: { id: string; name: string; roles: string[] }
      },
    ) =>
      fetcher({
        method: 'POST',
        url,
        data: arg,
      }),
  )
}

export function useRemoveUser() {
  const fetcher = useFetcher()

  return useSWRMutation(
    '/api/usystem/user/delete',
    (
      url,
      {
        arg,
      }: {
        arg: { id: string; name: string }
      },
    ) =>
      fetcher({
        method: 'POST',
        url,
        data: arg,
      }),
  )
}

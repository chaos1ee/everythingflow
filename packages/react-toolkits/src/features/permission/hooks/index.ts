import { useHttpClient, usePermission } from '@/hooks'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { PermissionEnumItem, RoleEnumItem, RoleV1, RoleV2 } from '../types'
import type { GameType } from '@/components/GameSelect'
import { useReactToolkitsContext } from '@/components'

export function useAllPermissions() {
  return useSWR<PermissionEnumItem[]>({
    url: '/api/usystem/user/allPermssions',
  })
}

export function useAllPermissionsV2() {
  return useSWR<{
    game: GameType[]
    permission: PermissionEnumItem[]
  }>({
    url: '/api/usystem/user/allPermissionsV2',
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
  const isPermissionV2 = useReactToolkitsContext(state => state.isPermissionV2)

  return useSWR<RoleV1 | RoleV2>({
    url: isPermissionV2 ? '/api/usystem/role/infoV2' : '/api/usystem/role/info',
    params: { name },
  })
}

export function useCreateRole() {
  const httpClient = useHttpClient()
  const isPermissionV2 = useReactToolkitsContext(state => state.isPermissionV2)

  return useSWRMutation(
    isPermissionV2 ? '/api/usystem/role/createV2' : '/api/usystem/role/create',
    (
      url: string,
      {
        arg,
      }: {
        arg: { name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }
      },
    ) => httpClient.post(url, arg),
  )
}

export function useUpdateRole() {
  const httpClient = useHttpClient()
  const isPermissionV2 = useReactToolkitsContext(state => state.isPermissionV2)

  return useSWRMutation(
    isPermissionV2 ? '/api/usystem/role/updateV2' : '/api/usystem/role/update',
    (
      url: string,
      {
        arg,
      }: {
        arg: { id: number; name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }
      },
    ) => httpClient.post(url, arg),
  )
}

export function useRemoveRole() {
  const httpClient = useHttpClient()

  return useSWRMutation(
    '/api/usystem/role/delete',
    (
      url,
      {
        arg,
      }: {
        arg: { id: number; name: string }
      },
    ) => httpClient.post(url, arg),
  )
}

export function useCreateUser() {
  const httpClient = useHttpClient()

  return useSWRMutation(
    '/api/usystem/user/create',
    (
      url,
      {
        arg,
      }: {
        arg: { name: string; roles: string[] }
      },
    ) => httpClient.post(url, arg),
  )
}

export function useUpdateUser() {
  const httpClient = useHttpClient()

  return useSWRMutation(
    '/api/usystem/user/update',
    (
      url,
      {
        arg,
      }: {
        arg: { id: string; name: string; roles: string[] }
      },
    ) => httpClient.post(url, arg),
  )
}

export function useRemoveUser() {
  const httpClient = useHttpClient()

  return useSWRMutation(
    '/api/usystem/user/delete',
    (
      url,
      {
        arg,
      }: {
        arg: { id: string; name: string }
      },
    ) => httpClient.post(url, arg),
  )
}

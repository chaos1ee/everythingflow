import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { PermissionEnumItem, RoleEnumItem, RoleV1, RoleV2 } from '../types'
import type { Game } from '@/components/GameSelect'
import { usePermission } from '@/hooks/permission'
import { useToolkitsContext } from '@/components/ContextProvider'
import { request } from '@/utils/request'

export function useAllPermissions() {
  return useSWR<PermissionEnumItem[]>(['/api/usystem/user/allPermssions', {}, true])
}

export function useAllPermissionsV2() {
  return useSWR<{
    game: Game[]
    permission: PermissionEnumItem[]
  }>(['/api/usystem/user/allPermissionsV2', {}, true])
}

export function useAllRoles() {
  const { accessible } = usePermission('200005')
  return useSWR<RoleEnumItem[]>(accessible ? ['/api/usystem/role/all', {}, true] : null)
}

export function useRole(name: string) {
  const { usePermissionV2 } = useToolkitsContext()
  return useSWR<RoleV1 | RoleV2>([`/api/usystem/role/${usePermissionV2 ? 'infoV2' : 'info'}?name=${name}`, {}, true])
}

export function useCreateRole() {
  const { usePermissionV2 } = useToolkitsContext()

  return useSWRMutation(
    usePermissionV2 ? '/api/usystem/role/createV2' : '/api/usystem/role/create',
    (
      url: string,
      {
        arg,
      }: {
        arg: { name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }
      },
    ) =>
      request(
        url,
        {
          method: 'post',
          body: arg,
        },
        true,
      ),
  )
}

export function useUpdateRole() {
  const { usePermissionV2 } = useToolkitsContext()

  return useSWRMutation(
    usePermissionV2 ? '/api/usystem/role/updateV2' : '/api/usystem/role/update',
    (
      url: string,
      {
        arg,
      }: {
        arg: { id: number; name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }
      },
    ) =>
      request(
        url,
        {
          method: 'post',
          body: arg,
        },
        true,
      ),
  )
}

export function useRemoveRole() {
  return useSWRMutation(
    '/api/usystem/role/delete',
    (
      url,
      {
        arg,
      }: {
        arg: { id: number; name: string }
      },
    ) =>
      request(
        url,
        {
          method: 'post',
          body: arg,
        },
        true,
      ),
  )
}

export function useCreateUser() {
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
      request(
        url,
        {
          method: 'post',
          body: arg,
        },
        true,
      ),
  )
}

export function useUpdateUser() {
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
      request(url, {
        method: 'post',
        body: arg,
      }),
  )
}

export function useRemoveUser() {
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
      request(
        url,
        {
          method: 'post',
          body: arg,
        },
        true,
      ),
  )
}

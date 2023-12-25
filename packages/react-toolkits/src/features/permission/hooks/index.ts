import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useToolkitsContext } from '../../../components/ContextProvider'
import type { Game } from '../../../components/GameSelect'
import { usePermission } from '../../../hooks/permission'
import { request } from '../../../utils/request'
import type { PermissionEnumItem, RoleEnumItem, RoleV1, RoleV2 } from '../types'

export function useAllPermissions() {
  return useSWR('/api/usystem/user/allPermssions', url =>
    request<PermissionEnumItem[]>(url, { isGlobalNS: true }).then(response => response.data),
  )
}

export function useAllPermissionsV2() {
  return useSWR('/api/usystem/user/allPermissionsV2', url =>
    request<{
      game: Game[]
      permission: PermissionEnumItem[]
    }>(url, { isGlobalNS: true }).then(response => response.data),
  )
}

export function useAllRoles() {
  const { accessible } = usePermission('200005', true)
  return useSWR(accessible ? '/api/usystem/role/all' : null, url =>
    request<RoleEnumItem[]>(url, { isGlobalNS: true }).then(response => response.data),
  )
}

export function useRole(name: string) {
  const { usePermissionApiV2 } = useToolkitsContext()
  return useSWR(`/api/usystem/role/${usePermissionApiV2 ? 'infoV2' : 'info'}?name=${name}`, (url: string) =>
    request<RoleV1 | RoleV2>(url, { isGlobalNS: true }).then(response => response.data),
  )
}

export function useCreateRole() {
  const { usePermissionApiV2 } = useToolkitsContext()

  return useSWRMutation(
    usePermissionApiV2 ? '/api/usystem/role/createV2' : '/api/usystem/role/create',
    (
      url: string,
      {
        arg,
      }: {
        arg: { name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }
      },
    ) =>
      request(url, {
        method: 'post',
        body: arg,
        isGlobalNS: true,
      }),
  )
}

export function useUpdateRole() {
  const { usePermissionApiV2 } = useToolkitsContext()

  return useSWRMutation(
    usePermissionApiV2 ? '/api/usystem/role/updateV2' : '/api/usystem/role/update',
    (
      url: string,
      {
        arg,
      }: {
        arg: { id: number; name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }
      },
    ) =>
      request(url, {
        method: 'post',
        body: arg,
        isGlobalNS: true,
      }),
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
      request(url, {
        method: 'post',
        body: arg,
        isGlobalNS: true,
      }),
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
      request(url, {
        method: 'post',
        body: arg,
        isGlobalNS: true,
      }),
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
        isGlobalNS: true,
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
      request(url, {
        method: 'post',
        body: arg,
        isGlobalNS: true,
      }),
  )
}

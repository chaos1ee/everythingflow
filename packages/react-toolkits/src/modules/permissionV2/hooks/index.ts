import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PermissionEnumItem, Role, RoleEnumItem } from '../types'
import { useGlobalHttpClient, usePermission } from '../../../hooks'
import { message } from 'antd'
import queries from '../queries'

export function useAllPermissions() {
  const client = useGlobalHttpClient()
  const path = '/usystem/user/allPermissionsV2'
  const { data, isLoading, isError } = useQuery({
    queryKey: [path],
    queryFn: () =>
      client.get<{
        game: {
          id: string
          name: string
          area: 'cn' | 'global'
          Ctime: string
          Custom1: 0 | 1 // 0 非线上 1 线上
        }[]
        permission: PermissionEnumItem[]
      }>(path),
  })

  return {
    isLoading,
    isError,
    permissions: data,
  }
}

export function useAllRoles() {
  const client = useGlobalHttpClient()
  const { accessible } = usePermission('200005', true)
  const path = '/usystem/role/all'
  const { data, isLoading, isError } = useQuery({
    queryKey: [path],
    queryFn: () => client.get<RoleEnumItem[]>(path),
    enabled: accessible,
  })

  return {
    roles: data ?? [],
    isLoading,
    isError,
  }
}

export function useRole(name: string) {
  const client = useGlobalHttpClient()
  return useQuery({
    queryKey: ['/usystem/role/info', name],
    queryFn: () => client.get<Role>('/usystem/role/infoV2', { params: { name } }),
    cacheTime: 0,
    enabled: !!name,
  })
}

export function useCreateRole() {
  const client = useGlobalHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; permissions: Record<string, string[]> }) =>
      client.post('/usystem/role/createV2', payload),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: queries['/usystem/role/list']._def })
    },
  })
}

export function useUpdateRole() {
  const client = useGlobalHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; name: string; permissions: Record<string, string[]> }) =>
      client.post('/usystem/role/updateV2', payload),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: queries['/usystem/role/list']._def })
    },
  })
}

export function useDeleteRole() {
  const client = useGlobalHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; name: string }) => client.post('/usystem/role/delete', payload),
    async onSuccess() {
      message.success('角色删除成功')
      await queryClient.invalidateQueries({ queryKey: queries['/usystem/role/list']._def })
    },
    async onError() {
      await message.error('角色删除失败')
    },
  })
}

export function useCreateUser() {
  const client = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { name: string; roles: string[] }) => client.post('/usystem/user/create', payload),
  })
}

export function useUpdateUser() {
  const client = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { id: string; name: string; roles: string[] }) =>
      client.post('/usystem/user/update', payload),
  })
}

export function useDeleteUser() {
  const client = useGlobalHttpClient()

  return useMutation({
    mutationFn: (payload: { id: string; name: string }) => client.post('/usystem/user/delete', payload),
  })
}

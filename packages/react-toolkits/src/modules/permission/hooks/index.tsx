import { useMutation, useQuery } from '@tanstack/react-query'
import type { PermissionEnumItem, Role, RoleEnumItem } from '../types'
import { useGlobalHttpClient, usePermission } from '../../../hooks'
import { FormModal } from '../../../components'
import { App, Form, Input } from 'antd'
import PermissionList from '../components/PermissionList'

export function useAllPermissions() {
  const httpClient = useGlobalHttpClient()
  const { data, ...restData } = useQuery({
    queryKey: ['/usystem/user/allPermssions'],
    queryFn: () => httpClient.get<PermissionEnumItem[]>('/usystem/user/allPermssions'),
  })

  return {
    ...restData,
    permissions: data,
  }
}

export function useAllRoles() {
  const httpClient = useGlobalHttpClient()
  const { accessible } = usePermission('200005')

  const { data, isError, ...restData } = useQuery({
    queryKey: ['/usystem/role/all'],
    queryFn: () => httpClient.get<RoleEnumItem[]>('/usystem/role/all'),
    enabled: accessible,
  })

  if (!accessible) {
    return {
      ...restData,
      roles: [],
      isLoading: false,
      isError: true,
    }
  }

  if (isError) {
    return {
      ...restData,
      roles: [],
    }
  }

  return {
    ...restData,
    roles: data,
  }
}

export function useRole(name: string) {
  const httpClient = useGlobalHttpClient()
  return useQuery({
    queryKey: ['/usystem/role/info', name],
    queryFn: () => httpClient.get<Role>('/usystem/role/info', { params: { name } }),
  })
}

export function useCreateRole() {
  const httpClient = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { name: string; permissions: string[] }) => httpClient.post('/usystem/role/create', payload),
  })
}

export function useUpdateRole() {
  const httpClient = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { id: number; name: string; permissions: string[] }) =>
      httpClient.post('/usystem/role/update', payload),
  })
}

export function useDeleteRole() {
  const httpClient = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { id: number; name: string }) => httpClient.post('/usystem/role/delete', payload),
  })
}

export function useCreateUser() {
  const httpClient = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { name: string; roles: string[] }) => httpClient.post('/usystem/user/create', payload),
  })
}

export function useUpdateUser() {
  const httpClient = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { id: string; name: string; roles: string[] }) =>
      httpClient.post('/usystem/user/update', payload),
  })
}

export function useDeleteUser() {
  const httpClient = useGlobalHttpClient()
  return useMutation({
    mutationFn: (payload: { id: string; name: string }) => httpClient.post('/usystem/user/delete', payload),
  })
}

export function useUpdateRoleModal(cb?: CallableFunction) {
  const { message } = App.useApp()
  const { mutateAsync } = useUpdateRole()

  return FormModal.useModal<{
    id: number
    name: string
    permissions: string[]
  }>({
    title: '更新角色',
    width: 800,
    layout: 'vertical',
    content: (
      <>
        <Form.Item hidden label="ID" name="id">
          <Input />
        </Form.Item>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input disabled addonBefore="role_" />
        </Form.Item>
        <Form.Item label="权限" name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    async onConfirm(values, { close }) {
      await mutateAsync(
        {
          id: values.id,
          name: `role_${values.name}`,
          permissions: values.permissions,
        },
        {
          async onSuccess() {
            close()
            await message.success('角色更新成功')
            await cb?.()
          },
        },
      )
    },
  })
}

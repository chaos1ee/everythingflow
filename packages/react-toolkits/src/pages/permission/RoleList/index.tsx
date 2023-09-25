import { Highlight, PermissionButton, QueryList, useToolkitContext } from '@/components'
import { useFormModal } from '@/components/FormModal/hooks'
import type { RoleListItem, RoleV1, RoleV2 } from '@/features/permission'
import { PermissionList, useCreateRole, useRemoveRole, useUpdateRole } from '@/features/permission'
import { usePermission } from '@/hooks'
import { useQueryListJump, useQueryListMutate } from '@/stores'
import { UsergroupAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space } from 'antd'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { request } from '@/utils'

const url = '/api/usystem/role/list'

const useCreateModal = () => {
  const { message } = App.useApp()
  const mutate = useQueryListMutate()
  const create = useCreateRole()

  const onConfirm = useCallback(
    async (values: { name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }) => {
      await create.trigger({
        name: `role_${values.name}`,
        permissions: values.permissions,
      })
      await mutate(url)
      message.success('角色创建成功')
    },
    [create, mutate, message],
  )

  return useFormModal<{
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }>({
    title: '创建角色',
    width: '50vw',
    layout: 'vertical',
    content: (
      <>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input addonBefore="role_" />
        </Form.Item>
        <Form.Item label="权限" name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    onConfirm,
  })
}

const useUpdateModal = () => {
  const { message } = App.useApp()
  const mutate = useQueryListMutate()
  const update = useUpdateRole()

  const onConfirm = useCallback(
    async (values: { id: number; name: string; permissions: RoleV1['permissions'] | RoleV2['permissions'] }) => {
      await update.trigger({
        id: values.id,
        name: `role_${values.name}`,
        permissions: values.permissions,
      })
      await mutate(url)
      message.success('角色更新成功')
    },
    [update, mutate, message],
  )

  return useFormModal<{
    id: number
    name: string
    permissions: RoleV1['permissions'] | RoleV2['permissions']
  }>({
    title: '更新角色',
    width: '50vw',
    layout: 'vertical',
    content: (
      <>
        <Form.Item hidden label="ID" name="id">
          <Input />
        </Form.Item>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input readOnly addonBefore="role_" />
        </Form.Item>
        <Form.Item label="权限" name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    onConfirm,
  })
}

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005')
  const { modal, message } = App.useApp()
  const { usePermissionV2 } = useToolkitContext()
  const remove = useRemoveRole()
  const jump = useQueryListJump()
  const { showModal: showCreateModal, Modal: CreateModal } = useCreateModal()
  const { showModal: showUpdateModal, Modal: UpdateModal } = useUpdateModal()

  const columns = useMemo<TableColumnsType<RoleListItem>>(
    () => [
      {
        title: '名称',
        key: 'name',
        render(value: RoleListItem) {
          if (viewable) {
            return <Link to={`${value.name}`}>{value.name}</Link>
          } else {
            return <>{value.name}</>
          }
        },
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '创建时间',
        dataIndex: 'ctime',
        key: 'ctime',
      },
      {
        title: '操作',
        width: 150,
        align: 'center',
        render: (value: RoleListItem) => {
          return (
            <Space size="small">
              <PermissionButton
                code="200003"
                size="small"
                type="link"
                onClick={async () => {
                  const { data: role } = await request<RoleV1 | RoleV2>(
                    `/api/usystem/role/info${usePermissionV2 ? 'V2' : ''}?name=${value.name}`,
                    {},
                    true,
                  )

                  showUpdateModal({
                    initialValues: {
                      id: role?.id,
                      permissions: role?.permissions,
                      name: role?.name.replace(/^role_/, ''),
                    },
                  })
                }}
              >
                更新
              </PermissionButton>
              <PermissionButton
                danger
                code="200004"
                size="small"
                type="link"
                onClick={() => {
                  modal.confirm({
                    title: '删除角色',
                    content: (
                      <Highlight texts={[value.name]}>
                        确定要删除角色&nbsp;
                        {value.name}
                        &nbsp;吗？
                      </Highlight>
                    ),
                    async onOk() {
                      await remove.trigger({
                        id: value.id,
                        name: value.name,
                      })
                      jump(url, 1)
                      message.success('角色删除成功')
                    },
                  })
                }}
              >
                删除
              </PermissionButton>
            </Space>
          )
        },
      },
    ],
    [viewable, usePermissionV2, showUpdateModal, modal, remove, message, jump],
  )

  return (
    <>
      <Card
        title="角色"
        extra={
          <PermissionButton
            type="primary"
            code="200002"
            icon={<UsergroupAddOutlined />}
            onClick={() => {
              showCreateModal()
            }}
          >
            创建角色
          </PermissionButton>
        }
      >
        <QueryList<RoleListItem, undefined, { List: RoleListItem[]; Total: number }>
          rowKey="name"
          columns={columns}
          code="200001"
          url={url}
          // 后端接口返回的数据不满足时转换一下
          transformResponse={response => {
            const { List, Total } = response
            return { list: List, total: Total }
          }}
        />
      </Card>
      {CreateModal}
      {UpdateModal}
    </>
  )
}

export default RoleList

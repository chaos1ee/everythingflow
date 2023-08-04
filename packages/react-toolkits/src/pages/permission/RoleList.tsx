import { Highlight, PermissionButton, QueryList } from '@/components'
import { useFormModal } from '@/components/FormModal/hooks'
import type { Role, RoleListItem } from '@/features/permission'
import { PermissionList, useCreateRole, useRemoveRole, useUpdateRole } from '@/features/permission'
import { useHttpClient, usePermission } from '@/hooks'
import { useQueryTriggerStore } from '@/stores'
import { UsergroupAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export const swrKey = {
  url: '/api/usystem/role/list',
}

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005')
  const { modal, message } = App.useApp()
  const httpClient = useHttpClient()
  const create = useCreateRole()
  const remove = useRemoveRole()
  const update = useUpdateRole()
  const trigger = useQueryTriggerStore(state => state.trigger)

  const { showModal: showCreateModal, Modal: CreateModal } = useFormModal<{
    name: string
    permissions: string[]
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
    async onConfirm(values) {
      await create.trigger(
        {
          name: `role_${values.name}`,
          permissions: values.permissions,
        },
        {
          async onSuccess() {
            await message.success('角色创建成功')
            trigger(swrKey)
          },
        },
      )
    },
  })

  const { showModal: showUpdateModal, Modal: UpdateModal } = useFormModal<{
    id: number
    name: string
    permissions: string[]
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
          <Input disabled addonBefore="role_" />
        </Form.Item>
        <Form.Item label="权限" name="permissions">
          <PermissionList />
        </Form.Item>
      </>
    ),
    async onConfirm(values) {
      await update.trigger(
        {
          id: values.id,
          name: `role_${values.name}`,
          permissions: values.permissions,
        },
        {
          async onSuccess() {
            await message.success('角色更新成功')
            trigger(swrKey)
          },
        },
      )
    },
  })

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
                  const role = await httpClient.get<Role>('/api/usystem/role/info', {
                    params: { name: value.name },
                  })
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
                      await remove.trigger(
                        {
                          id: value.id,
                          name: value.name,
                        },
                        {
                          async onSuccess() {
                            await message.success('角色删除成功')
                            trigger(swrKey)
                          },
                        },
                      )
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
    [trigger, viewable, httpClient, modal, message, remove, showUpdateModal],
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
        <QueryList
          rowKey="name"
          columns={columns}
          code="200001"
          swrKey={swrKey}
          transformArg={arg => {
            const { page, perPage, ...restValues } = arg
            return {
              ...restValues,
              page,
              size: perPage,
            }
          }}
        />
      </Card>
      {CreateModal}
      {UpdateModal}
    </>
  )
}

export default RoleList

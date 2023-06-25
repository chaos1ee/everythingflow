import { UsergroupAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { FormModal, PermissionButton, QueryList } from '../../../components'
import type { Role, RoleListItem } from '../types'
import { useCreateRole, useDeleteRole, useUpdateRoleModal } from '../hooks'
import { usePermission } from '../../../hooks'
import { useQueryClient } from '@tanstack/react-query'
import queries from '../queries'
import PermissionList from '../components/PermissionList'
import { createHttpClient } from '../../../httpClient'

const httpClient = createHttpClient({ headers: { 'app-id': 'global' } })

const { Text } = Typography

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005')
  const { modal } = App.useApp()
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const createMutation = useCreateRole()
  const deleteMutation = useDeleteRole()

  const { showModal: showCreateModal, Modal: CreateModal } = FormModal.useModal<{
    name: string
    permissions: string[]
  }>({
    title: '创建角色',
    width: 800,
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
    async onConfirm(values, { close }) {
      await createMutation.mutateAsync(
        {
          name: `role_${values.name}`,
          permissions: values.permissions,
        },
        {
          async onSuccess() {
            close()
            await queryClient.invalidateQueries({ queryKey: queries['/usystem/role/list']._def })
            await message.success('角色创建成功')
          },
        },
      )
    },
  })

  const { showModal: showUpdateModal, Modal: UpdateModal } = useUpdateRoleModal(async () => {
    await queryClient.invalidateQueries({ queryKey: queries['/usystem/role/list']._def })
  })

  const columns: TableColumnsType<RoleListItem> = [
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
      width: 200,
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
                const role = await httpClient.get<Role>('/usystem/role/info', { params: { name: value.name } })
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
                    <>
                      <span>确定要删除角色</span>
                      &nbsp;
                      <Text type="danger">{value.name}</Text>
                      &nbsp;
                      <span>吗？</span>
                    </>
                  ),
                  async onOk() {
                    await deleteMutation.mutateAsync(
                      {
                        id: value.id,
                        name: value.name,
                      },
                      {
                        async onSuccess() {
                          await queryClient.invalidateQueries({ queryKey: queries['/usystem/role/list']._def })
                          await message.success('角色删除成功')
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
  ]

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
          tableLayout="fixed"
          query={queries['/usystem/role/list']}
          code="200001"
          columns={columns}
          rowKey="name"
        />
      </Card>
      {CreateModal}
      {UpdateModal}
    </>
  )
}

export default RoleList

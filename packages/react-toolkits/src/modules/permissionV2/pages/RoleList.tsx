import { UsergroupAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Form, Input, Space, Typography } from 'antd'
import { Link } from 'react-router-dom'
import type { Role, RoleListItem } from '../types'
import { useCreateRole, useDeleteRole, useUpdateRole } from '../hooks'
import { useGlobalHttpClient, usePermission } from '../../../hooks'
import { FormModal, PermissionButton, QueryList } from '../../../components'
import PermissionList from '../components/PermissionList'
import queries from '../queries'

const { Text } = Typography

const RoleList = () => {
  const { accessible: viewable } = usePermission('200005', true)
  const { modal } = App.useApp()
  const createMutation = useCreateRole()
  const deleteMutation = useDeleteRole()
  const updateMutation = useUpdateRole()
  const client = useGlobalHttpClient()

  const { showModal: showCreateModal, Modal: CreateModal } = FormModal.useModal<{
    name: string
    permissions: Record<string, string[]>
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
          },
        },
      )
    },
  })

  const { showModal: showUpdateModal, Modal: UpdateModal } = FormModal.useModal<{
    id: number
    name: string
    permissions: Record<string, string[]>
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
      await updateMutation.mutateAsync(
        {
          id: values.id,
          name: `role_${values.name}`,
          permissions: values.permissions,
        },
        {
          async onSuccess() {
            close()
          },
        },
      )
    },
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
    },
    {
      title: '操作',
      width: 150,
      align: 'center',
      render: (value: RoleListItem) => {
        return (
          <Space size="small">
            <PermissionButton
              isGlobalNS
              code="200003"
              size="small"
              type="link"
              onClick={async () => {
                const role = await client.get<Role>('/usystem/role/infoV2', { params: { name: value.name } })
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
              isGlobalNS
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
                    await deleteMutation.mutateAsync({
                      id: value.id,
                      name: value.name,
                    })
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
            isGlobalNS
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
        <QueryList isGlobalNS query={queries['/usystem/role/list']} code="200001" columns={columns} rowKey="name" />
      </Card>
      {CreateModal}
      {UpdateModal}
    </>
  )
}

export default RoleList

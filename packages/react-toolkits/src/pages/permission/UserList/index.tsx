import { Highlight, PermissionButton, QueryList } from '@/components'
import { useFormModal } from '@/components/FormModal/hooks'
import type { UserListItem } from '@/features/permission'
import { useAllRoles, useCreateUser, useRemoveUser, useUpdateUser } from '@/features/permission'
import { UserAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Col, Form, Input, Row, Select, Space, Tag } from 'antd'
import type { FC } from 'react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQueryListJump, useQueryListMutate } from '@/stores'

const { Option } = Select

export const url = '/api/usystem/user/list'

function useCreatingUserModal() {
  const { message } = App.useApp()
  const create = useCreateUser()
  const { data: roles, isLoading } = useAllRoles()
  const mutate = useQueryListMutate()

  return useFormModal<{ id: string; name: string; roles: string[] }>({
    title: '创建用户',
    labelCol: { flex: '80px' },
    content: (
      <>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValue) => prevValues.type !== currentValue.type}>
          {({ getFieldValue }) => (
            <Form.Item label="名称" name="name" rules={[{ required: true }]}>
              <Input disabled={getFieldValue('id')} />
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item label="角色" name="roles">
          <Select allowClear mode="multiple" loading={isLoading}>
            {(roles ?? []).map(role => (
              <Option value={role.name} key={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    ),
    async onConfirm(values) {
      await create.trigger(values)
      await mutate(url)
      message.success('用户创建成功')
    },
  })
}

function useUpdatingUserModal() {
  const { message } = App.useApp()
  const update = useUpdateUser()
  const { data: roles, isLoading } = useAllRoles()
  const mutate = useQueryListMutate()

  return useFormModal<{ id: string; name: string; roles: string[] }>({
    title: '更新用户',
    labelCol: { flex: '80px' },
    content: (
      <>
        <Form.Item hidden name="id">
          <Input />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValue) => prevValues.type !== currentValue.type}>
          {({ getFieldValue }) => (
            <Form.Item label="名称" name="name" rules={[{ required: true }]}>
              <Input disabled={getFieldValue('id')} />
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item label="角色" name="roles">
          <Select allowClear mode="multiple" loading={isLoading}>
            {(roles ?? []).map(role => (
              <Option value={role.name} key={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    ),
    async onConfirm(values) {
      await update.trigger(values)
      await mutate(url)
      message.success('用户更新成功')
    },
  })
}

const UserList: FC = () => {
  const { modal, message } = App.useApp()
  const remove = useRemoveUser()
  const jump = useQueryListJump()
  const { showModal: showCreatingModal, Modal: CreatingModal } = useCreatingUserModal()
  const { showModal: showUpdatingModal, Modal: UpdatingModal } = useUpdatingUserModal()

  const columns = useMemo<TableColumnsType<UserListItem>>(() => {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        width: '40%',
        render(value: string[]) {
          return (
            <Row gutter={[4, 4]}>
              {(value || []).map((item: string) => (
                <Col key={item}>
                  {item === 'root' ? (
                    <Tag color="#f50">{item}</Tag>
                  ) : (
                    <Tag color="#ff5a00">
                      <Link to={`/permission/role/${item}`}>{item}</Link>
                    </Tag>
                  )}
                </Col>
              ))}
            </Row>
          )
        },
      },
      {
        title: '创建时间',
        dataIndex: 'Ctime',
        key: 'ctime',
      },
      {
        title: '操作',
        width: 150,
        align: 'center',
        render: (value: UserListItem) => (
          <Space>
            <PermissionButton
              size="small"
              type="link"
              code="100003"
              onClick={() => {
                showUpdatingModal({
                  initialValues: {
                    id: value.id,
                    name: value.name,
                    roles: value.roles,
                  },
                })
              }}
            >
              更新
            </PermissionButton>
            <PermissionButton
              danger
              size="small"
              code="100004"
              type="link"
              onClick={() => {
                modal.confirm({
                  title: '删除用户',
                  content: (
                    <Highlight texts={[value.name]}>
                      确定要删除用户&nbsp;
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
                    message.success('用户删除成功')
                  },
                })
              }}
            >
              删除
            </PermissionButton>
          </Space>
        ),
      },
    ]
  }, [jump, remove, message, modal, showUpdatingModal])

  return (
    <>
      <Card
        title="用户"
        extra={
          <PermissionButton
            type="primary"
            icon={<UserAddOutlined />}
            code="100002"
            onClick={() => {
              showCreatingModal()
            }}
          >
            创建用户
          </PermissionButton>
        }
      >
        <Form>
          <QueryList<UserListItem, undefined, { List: UserListItem[]; Total: number }>
            code="100001"
            url={url}
            rowKey="id"
            columns={columns}
            transformResponse={response => {
              const { List, Total } = response
              return { list: List, total: Total }
            }}
          />
        </Form>
      </Card>
      {CreatingModal}
      {UpdatingModal}
    </>
  )
}

export default UserList

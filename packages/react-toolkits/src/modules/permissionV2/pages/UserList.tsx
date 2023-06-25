import { UserAddOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import type { TableColumnsType } from 'antd'
import { App, Card, Col, Form, Input, message, Row, Select, Space, Tag, Typography } from 'antd'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FormModal, PermissionButton, QueryList } from '../../../components'
import { useAllRoles, useCreateUser, useDeleteUser, useUpdateUser } from '../hooks'
import type { FormModalRefType } from '../../../components/FormModal/FormModal'
import type { UserListItem } from '../types'
import queries from '../queries'

const { Option } = Select
const { Text } = Typography

const UserList: FC = () => {
  const modalRef = useRef<FormModalRefType>(null)
  const { modal } = App.useApp()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const queryClient = useQueryClient()

  const { roles, isLoading } = useAllRoles()

  const createMutation = useCreateUser()
  const deleteMutation = useDeleteUser()
  const updateMutation = useUpdateUser()

  const columns: TableColumnsType<UserListItem> = [
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
            isGlobalNS
            size="small"
            type="link"
            code="100003"
            onClick={() => {
              modalRef.current?.setFieldsValue({
                id: value.id,
                name: value.name,
                roles: value.roles,
              })
              setTitle('更新用户')
              openModal()
            }}
          >
            更新
          </PermissionButton>
          <PermissionButton
            danger
            isGlobalNS
            size="small"
            code="100004"
            type="link"
            onClick={() => {
              modal.confirm({
                title: '删除用户',
                content: (
                  <>
                    确定要删除用户&nbsp;
                    <Text type="danger">{value.name}</Text>
                    &nbsp;吗？
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
                        await queryClient.invalidateQueries({
                          queryKey: queries['/usystem/user/list']._def,
                        })
                        message.success('用户删除成功')
                      },
                      onError() {
                        message.error('用户删除失败')
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
      ),
    },
  ]

  const openModal = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
  }

  return (
    <>
      <Card
        title="用户"
        extra={
          <PermissionButton
            isGlobalNS
            type="primary"
            icon={<UserAddOutlined />}
            code="100002"
            onClick={() => {
              setTitle('创建用户')
              openModal()
            }}
          >
            创建用户
          </PermissionButton>
        }
      >
        <QueryList
          isGlobalNS
          code="100001"
          query={queries['/usystem/user/list']}
          rowKey="id"
          tableLayout="fixed"
          columns={columns}
        />
      </Card>
      <FormModal
        open={open}
        ref={modalRef}
        title={title}
        labelCol={{ flex: '80px' }}
        closeFn={() => setOpen(false)}
        onConfirm={(values: { id: string; name: string; roles: string[] }) => {
          if (values.id) {
            updateMutation.mutate(values, {
              async onSuccess() {
                await queryClient.invalidateQueries({
                  queryKey: queries['/usystem/user/list']._def,
                })
              },
            })
          } else {
            createMutation.mutate(values, {
              async onSuccess() {
                await queryClient.invalidateQueries({
                  queryKey: queries['/usystem/user/list']._def,
                })
              },
            })
          }
          closeModal()
        }}
      >
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
      </FormModal>
    </>
  )
}

export default UserList

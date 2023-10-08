import type { UserListItem } from '@/features/permission'
import { useAllRoles, useCreateUser, useRemoveUser, useUpdateUser } from '@/features/permission'
import { UserAddOutlined } from '@ant-design/icons'
import type { TableColumnsType } from 'antd'
import { App, Card, Col, Form, Input, Row, Select, Space, Tag } from 'antd'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useQueryListTrigger } from '@/stores/queryList'
import { useFormModal } from '@/components/FormModal'
import PermissionButton from '@/components/PermissionButton'
import Highlight from '@/components/Highlight'
import QueryList from '@/components/QueryList'
import { useTranslation } from '@/utils/i18n'

const { Option } = Select

export const url = '/api/usystem/user/list'

function useCreatingUserModal() {
  const { message } = App.useApp()
  const create = useCreateUser()
  const { data: roles, isLoading } = useAllRoles()
  const trigger = useQueryListTrigger()
  const t = useTranslation()

  return useFormModal<{ id: string; name: string; roles: string[] }>({
    title: t('UserList.createTitle'),
    labelCol: { flex: '80px' },
    content: (
      <>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValue) => prevValues.type !== currentValue.type}>
          {({ getFieldValue }) => (
            <Form.Item label={t('name')} name="name" rules={[{ required: true }]}>
              <Input disabled={getFieldValue('id')} />
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item label={t('role')} name="roles">
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
      trigger(url, { page: 1 })
      message.success(t('UserList.createSuccessfully'))
    },
  })
}

function useUpdatingUserModal() {
  const { message } = App.useApp()
  const update = useUpdateUser()
  const { data: roles, isLoading } = useAllRoles()
  const trigger = useQueryListTrigger()
  const t = useTranslation()

  return useFormModal<{ id: string; name: string; roles: string[] }>({
    title: t('UserList.updateTitle'),
    labelCol: { flex: '80px' },
    content: (
      <>
        <Form.Item hidden name="id">
          <Input />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, currentValue) => prevValues.type !== currentValue.type}>
          {({ getFieldValue }) => (
            <Form.Item label={t('name')} name="name" rules={[{ required: true }]}>
              <Input disabled={getFieldValue('id')} />
            </Form.Item>
          )}
        </Form.Item>
        <Form.Item label={t('role')} name="roles">
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
      trigger(url)
      message.success(t('UserList.updateSuccessfully'))
    },
  })
}

const UserList: FC = () => {
  const { modal, message } = App.useApp()
  const remove = useRemoveUser()
  const trigger = useQueryListTrigger()
  const { showModal: showCreatingModal, Modal: CreatingModal } = useCreatingUserModal()
  const { showModal: showUpdatingModal, Modal: UpdatingModal } = useUpdatingUserModal()
  const t = useTranslation()

  const columns: TableColumnsType<UserListItem> = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('role'),
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
      title: t('creationTime'),
      dataIndex: 'Ctime',
      key: 'ctime',
    },
    {
      title: t('operation'),
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
            {t('update')}
          </PermissionButton>
          <PermissionButton
            danger
            size="small"
            code="100004"
            type="link"
            onClick={() => {
              modal.confirm({
                title: t('UserList.deleteTitle'),
                content: (
                  <Highlight texts={[value.name]}>{t('UserList.deleteContent', { user: value.name })}</Highlight>
                ),
                async onOk() {
                  await remove.trigger({
                    id: value.id,
                    name: value.name,
                  })
                  trigger(url, { page: 1 })
                  message.success(t('UserList.deleteSuccessfully'))
                },
              })
            }}
          >
            {t('delete')}
          </PermissionButton>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card
        title={t('user')}
        extra={
          <PermissionButton
            type="primary"
            icon={<UserAddOutlined />}
            code="100002"
            onClick={() => {
              showCreatingModal()
            }}
          >
            {t('UserList.createTitle')}
          </PermissionButton>
        }
      >
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
      </Card>
      {CreatingModal}
      {UpdatingModal}
    </>
  )
}

export default UserList
